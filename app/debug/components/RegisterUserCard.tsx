'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Season } from '@/app/generated/prisma/enums';

interface UserInfo {
    id: number;
    osuid: number;
    username: string;
    avatar_url?: string;
    cover_url?: string;
    country_code: string;
    pp: number;
    global_rank: number;
    country_rank: number;
    seasonal: Season;
    userState: string;
    approved: boolean;
    seed: number;
}

export default function RegisterUserCard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchType, setSearchType] = useState<'osuid' | 'username'>('osuid');
    const [searchValue, setSearchValue] = useState('');
    const [updateData, setUpdateData] = useState({
        username: '',
        avatar_url: '',
        cover_url: '',
        country_code: '',
        pp: 0,
        global_rank: 0,
        country_rank: 0,
    });

    // 检查URL参数，处理OAuth回调结果，并检查当前登录状态
    useEffect(() => {
        const checkCurrentUser = async () => {
            console.log('Checking current user session...');
            try {
                const response = await fetch('/api/user/me', {
                    credentials: 'include', // 确保发送 cookie
                });
                
                console.log('API response status:', response.status);
                
                if (response.ok) {
                    const user = await response.json();
                    console.log('User found:', user.username);
                    
                    setUserInfo({
                        id: user.id,
                        osuid: user.osuid,
                        username: user.username,
                        avatar_url: user.avatar_url,
                        cover_url: user.cover_url,
                        country_code: user.country_code,
                        pp: user.pp,
                        global_rank: user.global_rank,
                        country_rank: user.country_rank,
                        seasonal: user.seasonal,
                        userState: user.userState,
                        approved: user.approved === 1,
                        seed: user.seed,
                    });

                    setUpdateData({
                        username: user.username,
                        avatar_url: user.avatar_url || '',
                        cover_url: user.cover_url || '',
                        country_code: user.country_code,
                        pp: user.pp,
                        global_rank: user.global_rank,
                        country_rank: user.country_rank,
                    });
                } else {
                    console.log('User not authenticated or API error:', response.status);
                }
            } catch (err) {
                // 忽略错误，用户可能未登录
                console.log('Error checking user session:', err);
            }

            // 检查URL参数，处理OAuth回调结果
            const params = new URLSearchParams(window.location.search);
            const successParam = params.get('success');
            const usernameParam = params.get('username');
            const osuidParam = params.get('osuid');
            const errorParam = params.get('error');

            if (successParam === 'true' && usernameParam && osuidParam) {
                setSuccess(`用户 ${usernameParam} (osuid: ${osuidParam}) 注册/登录成功！`);
                // 清空URL参数
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }

            if (errorParam) {
                setError(decodeURIComponent(errorParam));
                // 清空URL参数
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        };

        checkCurrentUser();
    }, []);

    const handleOsuLogin = () => {
        window.location.href = '/api/auth/getAuthUrl';
    };

    const handleSearchUser = async () => {
        if (!searchValue.trim()) {
            setError('请输入搜索值');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/user/search?type=${searchType}&value=${encodeURIComponent(searchValue)}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `搜索失败: ${response.status}`);
            }

            const user = await response.json();

            if (user) {
                setUserInfo({
                    id: user.id,
                    osuid: user.osuid,
                    username: user.username,
                    avatar_url: user.avatar_url,
                    cover_url: user.cover_url,
                    country_code: user.country_code,
                    pp: user.pp,
                    global_rank: user.global_rank,
                    country_rank: user.country_rank,
                    seasonal: user.seasonal,
                    userState: user.userState,
                    approved: user.approved === 1,
                    seed: user.seed,
                });

                setUpdateData({
                    username: user.username,
                    avatar_url: user.avatar_url || '',
                    cover_url: user.cover_url || '',
                    country_code: user.country_code,
                    pp: user.pp,
                    global_rank: user.global_rank,
                    country_rank: user.country_rank,
                });

                setSuccess(`找到用户: ${user.username} (ID: ${user.id})`);
            } else {
                setError('未找到用户');
                setUserInfo(null);
            }
        } catch (err) {
            setError('搜索用户失败: ' + (err instanceof Error ? err.message : String(err)));
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!userInfo) {
            setError('没有用户信息可更新');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const updatePayload: {
                username?: string;
                avatar_url?: string;
                cover_url?: string;
                country_code?: string;
                pp?: number;
                global_rank?: number;
                country_rank?: number;
            } = {};
            
            // 只添加有变化的字段
            if (updateData.username !== userInfo.username) updatePayload.username = updateData.username;
            if (updateData.avatar_url !== userInfo.avatar_url) updatePayload.avatar_url = updateData.avatar_url;
            if (updateData.cover_url !== userInfo.cover_url) updatePayload.cover_url = updateData.cover_url;
            if (updateData.country_code !== userInfo.country_code) updatePayload.country_code = updateData.country_code;
            if (updateData.pp !== userInfo.pp) updatePayload.pp = updateData.pp;
            if (updateData.global_rank !== userInfo.global_rank) updatePayload.global_rank = updateData.global_rank;
            if (updateData.country_rank !== userInfo.country_rank) updatePayload.country_rank = updateData.country_rank;

            // 如果没有变化，直接返回
            if (Object.keys(updatePayload).length === 0) {
                setSuccess('没有需要更新的信息');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    osuid: userInfo.osuid,
                    ...updatePayload,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `更新失败: ${response.status}`);
            }

            const updatedUser = await response.json();

            setUserInfo({
                id: updatedUser.id,
                osuid: updatedUser.osuid,
                username: updatedUser.username,
                avatar_url: updatedUser.avatar_url,
                cover_url: updatedUser.cover_url,
                country_code: updatedUser.country_code,
                pp: updatedUser.pp,
                global_rank: updatedUser.global_rank,
                country_rank: updatedUser.country_rank,
                seasonal: updatedUser.seasonal,
                userState: updatedUser.userState,
                approved: updatedUser.approved === 1,
                seed: updatedUser.seed,
            });

            setSuccess('用户信息更新成功！');
        } catch (err) {
            setError('更新用户信息失败: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // 调用 API 清除 cookie
            const response = await fetch('/api/user/me', {
                method: 'DELETE',
            });

            if (response.ok) {
                setUserInfo(null);
                setUpdateData({
                    username: '',
                    avatar_url: '',
                    cover_url: '',
                    country_code: '',
                    pp: 0,
                    global_rank: 0,
                    country_rank: 0,
                });
                setSuccess('已退出登录');
                setError(null);
            } else {
                setError('退出登录失败');
            }
        } catch (err) {
            setError('退出登录失败: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">用户注册与测试</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">osu! OAuth 登录</h3>
                <p className="text-gray-600 mb-4">使用 osu! 账号登录并自动注册用户</p>
                <button
                    onClick={handleOsuLogin}
                    disabled={loading}
                    className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
                >
                    {loading ? '处理中...' : '使用 osu! 账号登录'}
                </button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">搜索用户</h3>
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={searchType === 'osuid'}
                                onChange={() => setSearchType('osuid')}
                                className="mr-2"
                            />
                            osuid
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                checked={searchType === 'username'}
                                onChange={() => setSearchType('username')}
                                className="mr-2"
                            />
                            用户名
                        </label>
                    </div>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={searchType === 'osuid' ? '输入 osuid' : '输入用户名'}
                        className="flex-grow px-3 py-2 border rounded"
                    />
                    <button
                        onClick={handleSearchUser}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? '搜索中...' : '搜索用户'}
                    </button>
                </div>
            </div>

            {userInfo && (
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">用户信息</h3>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            退出登录
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <p><strong>ID:</strong> {userInfo.id}</p>
                            <p><strong>osuid:</strong> {userInfo.osuid}</p>
                            <p><strong>用户名:</strong> {userInfo.username}</p>
                            <p><strong>地区:</strong> {userInfo.country_code}</p>
                            <p><strong>PP:</strong> {userInfo.pp.toFixed(2)}</p>
                        </div>
                        <div>
                            <p><strong>全球排名:</strong> {userInfo.global_rank}</p>
                            <p><strong>地区排名:</strong> {userInfo.country_rank}</p>
                            <p><strong>赛季:</strong> {userInfo.seasonal}</p>
                            <p><strong>状态:</strong> {userInfo.userState}</p>
                            <p><strong>已批准:</strong> {userInfo.approved ? '是' : '否'}</p>
                            <p><strong>种子:</strong> {userInfo.seed}</p>
                        </div>
                    </div>

                    {userInfo.avatar_url && (
                        <div className="mb-4">
                            <p className="font-semibold mb-2">头像:</p>
                            <Image src={userInfo.avatar_url}
                                alt="用户头像"
                                className="w-24 h-24 rounded-full"
                                width={24}
                                height={24}
                                />

                        </div>
                    )}

                    <div className="mt-6">
                        <h4 className="text-md font-semibold mb-3">更新用户信息</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">用户名</label>
                                <input
                                    type="text"
                                    value={updateData.username}
                                    onChange={(e) => setUpdateData({...updateData, username: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">地区代码</label>
                                <input
                                    type="text"
                                    value={updateData.country_code}
                                    onChange={(e) => setUpdateData({...updateData, country_code: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">PP</label>
                                <input
                                    type="number"
                                    value={updateData.pp}
                                    onChange={(e) => setUpdateData({...updateData, pp: parseFloat(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">全球排名</label>
                                <input
                                    type="number"
                                    value={updateData.global_rank}
                                    onChange={(e) => setUpdateData({...updateData, global_rank: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">地区排名</label>
                                <input
                                    type="number"
                                    value={updateData.country_rank}
                                    onChange={(e) => setUpdateData({...updateData, country_rank: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">头像URL</label>
                                <input
                                    type="text"
                                    value={updateData.avatar_url}
                                    onChange={(e) => setUpdateData({...updateData, avatar_url: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">封面URL</label>
                                <input
                                    type="text"
                                    value={updateData.cover_url}
                                    onChange={(e) => setUpdateData({...updateData, cover_url: e.target.value})}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                        </div>
                        
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? '更新中...' : '更新用户信息'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
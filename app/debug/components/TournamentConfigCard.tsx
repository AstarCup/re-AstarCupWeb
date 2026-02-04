"use client"
import { useState, useEffect, use } from 'react';
import { Season, Category } from '@/app/generated/prisma/enums';
import { useSeasonOptions, useCategoryOptions } from '@/app/lib/enum-labels';

interface TournamentConfigData {
    id: number;
    tournament_name: string;
    max_pp_for_registration: number;
    min_pp_for_registration: number;
    current_seasonal: Season;
    current_category: Category;
    canRegister: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface TournamentConfigCardProps {
    initialData?: TournamentConfigData;
    onUpdate?: (data: TournamentConfigData) => void;
    onError?: (error: Error) => void;
}

export default function TournamentConfigCard({
    initialData,
    onUpdate,
    onError
}: TournamentConfigCardProps) {
    // 状态管理
    const [config, setConfig] = useState<TournamentConfigData | null>(initialData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 表单状态
    const [formData, setFormData] = useState({
        tournament_name: '',
        max_pp_for_registration: 0,
        min_pp_for_registration: 0,
        current_seasonal: 'S1' as Season,
        current_category: 'QUA' as Category,
        canRegister: false,
    });

    // 枚举选项
    const seasonOptions = useSeasonOptions();
    const categoryOptions = useCategoryOptions();

    // 初始化函数
    const initializeForm = (data: TournamentConfigData) => {
        setFormData({
            tournament_name: data.tournament_name,
            max_pp_for_registration: data.max_pp_for_registration,
            min_pp_for_registration: data.min_pp_for_registration,
            current_seasonal: data.current_seasonal,
            current_category: data.current_category,
            canRegister: data.canRegister,
        });
    };

    const initConfig = async () => {
        try {
            const response = await fetch('/api/admin/init-database', {
                method: 'GET',
            });
            const data = await response.json();
            setConfig(data);
            initializeForm(data);
        } catch (error) {
            console.error('初始化比赛配置失败:', error);
        }
    }

    // 加载配置
    const loadConfig = async () => {
        setLoading(true);
        setError(null);

        try {
            // 这里需要调用 API 路由
            const response = await fetch('/api/config',{ method:'GET',});
            if (!response.ok) {
                throw new Error(`加载失败: ${response.status}`);
            }

            const data = await response.json();
            setConfig(data);
            initializeForm(data);
            setSuccess('配置加载成功');

            if (onUpdate) {
                onUpdate(data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            setError(`加载配置失败: ${errorMessage}`);

            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage));
            }
        } finally {
            setLoading(false);
        }
    };

    // 保存配置
    const saveConfig = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/admin/set-config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`保存失败: ${response.status}`);
            }

            const data = await response.json();
            setConfig(data);
            setSuccess('配置保存成功');

            if (onUpdate) {
                onUpdate(data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '未知错误';
            setError(`保存配置失败: ${errorMessage}`);

            if (onError) {
                onError(err instanceof Error ? err : new Error(errorMessage));
            }
        } finally {
            setLoading(false);
        }
    };

    // 重置为默认值
    const resetToDefaults = () => {
        setFormData({
            tournament_name: 'AstarCup',
            max_pp_for_registration: 0,
            min_pp_for_registration: 0,
            current_seasonal: 'S1',
            current_category: 'QUA',
            canRegister: false,
        });
        setSuccess('已重置为默认值');
    };

    // 表单变化处理
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // 组件挂载时加载数据
    useEffect(() => {
        if (!initialData) {
            loadConfig();
        } else {
            initializeForm(initialData);
        }
    }, [initialData]);

    // 渲染组件
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">比赛配置管理</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={loadConfig}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                        刷新
                    </button>
                    <button
                        onClick={initConfig}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                        初始化
                    </button>
                    <button
                        onClick={resetToDefaults}
                        disabled={loading}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        重置默认
                    </button>
                </div>
            </div>

            {/* 状态提示 */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* 配置信息 */}
            {config && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div>ID: <span className="font-mono">{config.id}</span></div>
                        <div>创建时间: <span className="font-mono">{new Date(config.createdAt).toLocaleString()}</span></div>
                        <div>更新时间: <span className="font-mono">{new Date(config.updatedAt).toLocaleString()}</span></div>
                    </div>
                </div>
            )}

            {/* 表单 */}
            <div className="space-y-4">
                {/* 比赛名称 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        比赛名称
                    </label>
                    <input
                        type="text"
                        name="tournament_name"
                        value={formData.tournament_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入比赛名称"
                    />
                </div>

                {/* PP 限制 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            最小PP限制
                        </label>
                        <input
                            type="number"
                            name="min_pp_for_registration"
                            value={formData.min_pp_for_registration}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.1"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            最大PP限制
                        </label>
                        <input
                            type="number"
                            name="max_pp_for_registration"
                            value={formData.max_pp_for_registration}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.1"
                            min="0"
                        />
                    </div>
                </div>

                {/* 赛季和分类 */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            当前赛季
                        </label>
                        <select
                            name="current_seasonal"
                            value={formData.current_seasonal}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {seasonOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            当前分类
                        </label>
                        <select
                            name="current_category"
                            value={formData.current_category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categoryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 注册开关 */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="canRegister"
                        name="canRegister"
                        checked={formData.canRegister}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="canRegister" className="ml-2 block text-sm text-gray-700">
                        允许玩家注册
                    </label>
                    <span className="ml-2 text-xs text-gray-500">
                        {formData.canRegister ? '✓ 注册已开放' : '✗ 注册已关闭'}
                    </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        onClick={loadConfig}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={saveConfig}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                保存中...
                            </>
                        ) : (
                            '保存配置'
                        )}
                    </button>
                </div>
            </div>

            {/* 调试信息（开发环境显示） */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">调试信息</h3>
                    <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                        {JSON.stringify({
                            formData,
                            config,
                            loading,
                            error,
                            success,
                        }, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

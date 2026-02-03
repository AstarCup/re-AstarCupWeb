import { getValidClientToken } from './osuAuth';

export interface OsuUser {
    id: number;
    username: string;
    avatar_url: string;
    country_code: string;
    cover?: {
        custom_url: string | null;
        url: string;
        id: string | null;
    };
    statistics: {
        pp: number;
        global_rank: number | null;
        country_rank: number | null;
        country: string;
        ranked_score: number;
        hit_accuracy: number;
        play_count: number;
        play_time: number;
        level: {
            current: number;
            progress: number;
        };
        grade_counts: {
            ss: number;
            ssh: number;
            s: number;
            sh: number;
            a: number;
        };
    };
}


/// input osu! user ID, output osu! user data
export async function getUserData(userID: number): Promise<OsuUser | null> {
    try {
        // 获取客户端token
        const accessToken = await getValidClientToken();

        const response = await fetch(`https://osu.ppy.sh/api/v2/users/${userID}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('玩家不存在');
            }
            throw new Error(`获取玩家数据失败: ${response.status}`);
        }

        const data = await response.json();

        return {
            id: data.id,
            username: data.username,
            avatar_url: data.avatar_url,
            country_code: data.country_code,
            cover: data.cover ? {
                custom_url: data.cover.custom_url || null,
                url: data.cover.url || '',
                id: data.cover.id || null,
            } : undefined,
            statistics: {
                pp: data.statistics?.pp || 0,
                global_rank: data.statistics?.global_rank || null,
                country_rank: data.statistics?.country_rank || null,
                country: data.country_code || '',
                ranked_score: data.statistics?.ranked_score || 0,
                hit_accuracy: data.statistics?.hit_accuracy || 0,
                play_count: data.statistics?.play_count || 0,
                play_time: data.statistics?.play_time || 0,
                level: {
                    current: data.statistics?.level?.current || 0,
                    progress: data.statistics?.level?.progress || 0,
                },
                grade_counts: {
                    ss: data.statistics?.grade_counts?.ss || 0,
                    ssh: data.statistics?.grade_counts?.ssh || 0,
                    s: data.statistics?.grade_counts?.s || 0,
                    sh: data.statistics?.grade_counts?.sh || 0,
                    a: data.statistics?.grade_counts?.a || 0,
                },
            },
        };
    } catch (error) {
        console.error('Error fetching osu! user data:', error);
        throw error;
    }
}


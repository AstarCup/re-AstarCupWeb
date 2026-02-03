import { getValidClientToken } from './osuAuth';

export interface BeatmapInfo {
    id: number;
    beatmapset_id: number;
    title: string;
    title_unicode: string;
    artist: string;
    artist_unicode: string;
    version: string;
    creator: string;
    star_rating: number;
    bpm: number;
    total_length: number;
    max_combo: number;
    ar: number;
    cs: number;
    od: number;
    hp: number;
    url: string;
    cover_url: string;
}

/// get beatmap info by beatmap ID
export async function getBeatmapInfo(beatmapId: number): Promise<BeatmapInfo | null> {
    try {
        const accessToken = await getValidClientToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };
        const response = await fetch(`https://osu.ppy.sh/api/v2/beatmaps/${beatmapId}`, {
            headers,
        });
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Beatmap不存在');
            }
            throw new Error(`获取Beatmap信息失败: ${response.status}`);
        }

        const data = await response.json();

        return {
            id: data.id,
            beatmapset_id: data.beatmapset_id,
            title: data.beatmapset?.title || '',
            title_unicode: data.beatmapset?.title_unicode || data.beatmapset?.title || '',
            artist: data.beatmapset?.artist || '',
            artist_unicode: data.beatmapset?.artist_unicode || data.beatmapset?.artist || '',
            version: data.version || '',
            creator: data.beatmapset?.creator || '',
            star_rating: data.difficulty_rating || 0,
            bpm: data.bpm || 0,
            total_length: data.total_length || 0,
            max_combo: data.max_combo || 0,
            ar: data.ar || 0,
            cs: data.cs || 0,
            od: data.accuracy || 0,
            hp: data.drain || 0,
            url: data.url || `https://osu.ppy.sh/beatmaps/${data.id}`,
            cover_url: data.beatmapset?.covers?.cover || data.beatmapset?.covers?.card || ''
        };
    } catch (error) {
        console.error('Error fetching beatmap info:', error);
        throw error;
    }
}

/// get beatmapset info by beatmapset ID
export async function getBeatmapsetInfo(beatmapsetId: number): Promise<BeatmapInfo[]> {
    try {
        const accessToken = await getValidClientToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };

        const response = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/${beatmapsetId}`, {
            headers,
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Beatmapset不存在');
            }
            throw new Error(`获取Beatmapset信息失败: ${response.status}`);
        }

        const data = await response.json();

        return data.beatmaps?.map((beatmap: any) => ({
            id: beatmap.id,
            beatmapset_id: beatmap.beatmapset_id,
            title: data.title || '',
            title_unicode: data.title_unicode || data.title || '',
            artist: data.artist || '',
            artist_unicode: data.artist_unicode || data.artist || '',
            version: beatmap.version || '',
            creator: data.creator || '',
            star_rating: beatmap.difficulty_rating || 0,
            bpm: beatmap.bpm || 0,
            total_length: beatmap.total_length || 0,
            max_combo: beatmap.max_combo || 0,
            ar: beatmap.ar || 0,
            cs: beatmap.cs || 0,
            od: beatmap.accuracy || 0,
            hp: beatmap.drain || 0,
            url: beatmap.url || `https://osu.ppy.sh/beatmaps/${beatmap.id}`,
            cover_url: data.covers?.cover || data.covers?.card || ''
        })) || [];
    } catch (error) {
        console.error('Error fetching beatmapset info:', error);
        throw error;
    }
}
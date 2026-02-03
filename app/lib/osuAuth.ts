const OSU_CLIENT_ID = process.env.OSU_CLIENT_ID || '';
const OSU_CLIENT_SECRET = process.env.OSU_CLIENT_SECRET || '';
const OSU_REDIRECT_URI = process.env.OSU_REDIRECT_URI || 'http://localhost:3000/auth/osu/callback';

export function getOsuAuthUrl() {
    if (!OSU_CLIENT_ID || !OSU_CLIENT_SECRET) {
        throw new Error('OSU_CLIENT_ID or OSU_CLIENT_SECRET is not set in environment variables.');
    }

    const params = new URLSearchParams({
        client_id: OSU_CLIENT_ID,
        redirect_uri: OSU_REDIRECT_URI,
        response_type: 'code',
        scope: 'public identify',
    });

    return `https://osu.ppy.sh/oauth/authorize?${params.toString()}`;
}

export async function getOsuToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
}> {
    try {
        const response = await fetch('https://osu.ppy.sh/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: OSU_CLIENT_ID,
                client_secret: OSU_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: OSU_REDIRECT_URI,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token exchange failed:', response.status, errorText);
            throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
        }

        try {
            const tokenData = await response.json();
            return tokenData;
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            const responseText = await response.text();
            console.error('Response text:', responseText);
            throw new Error(`Failed to parse token response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
    } catch (error) {
        console.error('Token exchange error:', error);
        throw error;
    }
}

export async function getOsuClientToken(): Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
}> {
    try {
        console.log('Checking OSU_CLIENT_ID and OSU_CLIENT_SECRET...');
        if (!OSU_CLIENT_ID || !OSU_CLIENT_SECRET) {
            throw new Error('OSU_CLIENT_ID and OSU_CLIENT_SECRET must be configured');
        }

        console.log('Requesting client token from osu API...');
        const response = await fetch('https://osu.ppy.sh/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: OSU_CLIENT_ID,
                client_secret: OSU_CLIENT_SECRET,
                grant_type: 'client_credentials',
                scope: 'public'
            }),
        });

        console.log('Token request response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Token request failed:', errorText);
            throw new Error(`Failed to get client token: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Token obtained successfully');
        return data;
    } catch (error) {
        console.error('Error getting client token:', error);
        throw error;
    }
}

let clientToken: { token: string; expires: number } | null = null;

export async function getValidClientToken(): Promise<string> {
    const now = Date.now() / 1000;

    console.log('Checking client token cache...');
    if (clientToken && clientToken.expires > now + 60) {
        console.log('Using cached client token');
        return clientToken.token;
    }

    const tokenData = await getOsuClientToken();
    console.log('New token obtained, expires in:', tokenData.expires_in, 'seconds');
    clientToken = {
        token: tokenData.access_token,
        expires: now + tokenData.expires_in,
    };

    return clientToken.token;
}

export async function getMyOsuInfo(accessToken: string): Promise<{
    id: number;
    username: string;
    avatar_url: string;
    country_code: string;
    cover?: {
        custom_url: string | null;
        url: string;
        id: string | null;
    };
    statistics?: {
        pp: number;
        global_rank: number | null;
        country_rank: number | null;
        country: string;
    };
}> {
    const response = await fetch('https://osu.ppy.sh/api/v2/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get user info');
    }

    const userData = await response.json();

    return {
        id: userData.id,
        username: userData.username,
        avatar_url: userData.avatar_url,
        country_code: userData.country_code,
        cover: userData.cover ? {
            custom_url: userData.cover.custom_url || null,
            url: userData.cover.url || '',
            id: userData.cover.id || null,
        } : undefined,
        statistics: userData.statistics ? {
            pp: userData.statistics.pp,
            global_rank: userData.statistics.global_rank,
            country_rank: userData.statistics.country_rank,
            country: userData.country_code || '',
        } : undefined,
    };
}


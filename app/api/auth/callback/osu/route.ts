import { NextRequest, NextResponse } from 'next/server';
import { getOsuToken, getMyOsuInfo } from '@/app/lib/osuAuth';
import { CreateUser } from '@/app/lib/UserOperation';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 检查错误
        if (error) {
            console.error('OAuth error:', error, errorDescription);
            return NextResponse.redirect(new URL('/debug?error=' + encodeURIComponent(errorDescription || error), request.url));
        }

        // 检查授权码
        if (!code) {
            console.error('No authorization code provided');
            return NextResponse.redirect(new URL('/debug?error=No authorization code provided', request.url));
        }

        console.log('Received OAuth code:', code);

        try {
            // 获取访问令牌
            const tokenData = await getOsuToken(code);
            console.log('Token obtained successfully');

            // 获取用户信息
            const userInfo = await getMyOsuInfo(tokenData.access_token);
            console.log('User info obtained:', userInfo.username, userInfo.id);

            // 创建更新用户
            const userSession = await CreateUser({
                osuid: userInfo.id,
                username: userInfo.username,
                avatar_url: userInfo.avatar_url,
                cover_url: userInfo.cover?.url,
                country_code: userInfo.country_code,
                pp: userInfo.statistics?.pp || 0,
                global_rank: userInfo.statistics?.global_rank || null,
                country_rank: userInfo.statistics?.country_rank || null,
            });

            console.log('User created/updated successfully:', userSession.username);

            const redirectUrl = new URL('/debug', request.url);
            redirectUrl.searchParams.set('success', 'true');
            redirectUrl.searchParams.set('username', userSession.username);
            redirectUrl.searchParams.set('osuid', userSession.osuid.toString());
            redirectUrl.searchParams.set('userId', userSession.id.toString());

            const response = NextResponse.redirect(redirectUrl);
            const userCookieData = {
                id: userSession.id,
                osuid: userSession.osuid,
                username: userSession.username,
                avatar_url: userSession.avatar_url || '',
                country_code: userSession.country_code,
            };

            // 设置 cookie 7 天
            response.cookies.set('user_session', JSON.stringify(userCookieData), {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 604800, // 7 天
                path: '/',
            });

            return response;

        } catch (apiError) {
            console.error('API error during OAuth flow:', apiError);
            return NextResponse.redirect(
                new URL('/debug?error=' + encodeURIComponent('Failed to process OAuth: ' + (apiError instanceof Error ? apiError.message : String(apiError))), request.url)
            );
        }

    } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        return NextResponse.redirect(
            new URL('/debug?error=' + encodeURIComponent('Unexpected error: ' + (error instanceof Error ? error.message : String(error))), request.url)
        );
    }
}
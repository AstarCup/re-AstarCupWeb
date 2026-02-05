import { NextRequest, NextResponse } from 'next/server';
import { getUserByOsuId } from '@/app/lib/UserOperation';

export async function GET(request: NextRequest) {
    try {
        // 从 cookie 中获取用户会话
        const userSessionCookie = request.cookies.get('user_session');
        
        console.log('Cookie received:', userSessionCookie ? 'yes' : 'no');
        if (userSessionCookie) {
            console.log('Cookie value length:', userSessionCookie.value.length);
            console.log('Cookie value first 100 chars:', userSessionCookie.value.substring(0, 100));
        }
        
        if (!userSessionCookie || !userSessionCookie.value) {
            console.log('No user session cookie found');
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        try {
            const userData = JSON.parse(userSessionCookie.value);
            console.log('Parsed user data:', userData);
            
            // 从数据库获取完整的用户信息
            const user = await getUserByOsuId(userData.osuid);
            
            if (!user) {
                console.log('User not found in database for osuid:', userData.osuid);
                // 如果数据库中没有用户，清除 cookie
                const response = NextResponse.json(
                    { error: 'User not found in database' },
                    { status: 404 }
                );
                response.cookies.delete('user_session');
                return response;
            }

            console.log('User found:', user.username);
            return NextResponse.json(user);
        } catch (parseError) {
            console.error('Error parsing user session cookie:', parseError);
            console.error('Raw cookie value:', userSessionCookie.value);
            // 清除无效的 cookie
            const response = NextResponse.json(
                { error: 'Invalid session' },
                { status: 400 }
            );
            response.cookies.delete('user_session');
            return response;
        }
    } catch (error) {
        console.error('Error getting current user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // 清除用户会话 cookie
        const response = NextResponse.json({ success: true });
        response.cookies.delete('user_session');
        return response;
    } catch (error) {
        console.error('Error logging out:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from 'next/server';
import { getUserByOsuId, getUserByUsername } from '@/app/lib/UserOperation';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type'); // 'osuid' or 'username'
        const value = searchParams.get('value');

        if (!type || !value) {
            return NextResponse.json(
                { error: 'Missing type or value parameter' },
                { status: 400 }
            );
        }

        let user;
        if (type === 'osuid') {
            const osuid = parseInt(value);
            if (isNaN(osuid)) {
                return NextResponse.json(
                    { error: 'Invalid osuid' },
                    { status: 400 }
                );
            }
            user = await getUserByOsuId(osuid);
        } else if (type === 'username') {
            user = await getUserByUsername(value);
        } else {
            return NextResponse.json(
                { error: 'Invalid type parameter. Use "osuid" or "username"' },
                { status: 400 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error searching user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
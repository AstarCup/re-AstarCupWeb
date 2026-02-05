import { NextResponse } from 'next/server';
import { getOsuAuthUrl } from '@/app/lib/osuAuth';

export async function GET() {
    try {
        const authUrl = getOsuAuthUrl();
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error generating OAuth URL:', error);
        return NextResponse.redirect(
            new URL('/debug?error=' + encodeURIComponent('Failed to initialize OAuth: ' + (error instanceof Error ? error.message : String(error))),
            new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
        );
    }
}
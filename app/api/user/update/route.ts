import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/app/lib/UserOperation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { osuid, ...updateData } = body;

        if (!osuid) {
            return NextResponse.json(
                { error: 'Missing osuid parameter' },
                { status: 400 }
            );
        }

        const updatedUser = await updateProfile(osuid, updateData);
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
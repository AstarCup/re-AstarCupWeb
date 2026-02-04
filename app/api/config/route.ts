import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/PrismaClient';


export async function GET() {
    try {
        const config = await prisma.tournamentConfig.findUnique({
            where: { id: 1 },
        });
        return NextResponse.json(config);
    } catch (error) {
        console.error('获取比赛配置失败:', error);
        return NextResponse.json(
            { error: '获取配置失败' },
            { status: 500 }
        );
    }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/PrismaClient';

// TODO: admin 验证

// INIT: 初始化配置 仅主办使用
export async function GET() {
    try {
        let config = await prisma.tournamentConfig.findUnique({
            where: { id: 1 },
        });
        if (!config) {
            config = await prisma.tournamentConfig.create({
                data: {
                    tournament_name: 'Astar Cup',
                    max_pp_for_registration: 1000,
                    min_pp_for_registration: 0,
                    current_seasonal: 'S1',
                    current_category: 'QUA',
                    canRegister: false,
                },
            });
        }
        return NextResponse.json(config);
    } catch (error) {
        console.error('初始化比赛配置失败:', error);
        return NextResponse.json(
            { error: '初始化配置失败' },
            { status: 500 }
        );
    }
}

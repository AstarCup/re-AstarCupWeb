import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/PrismaClient';

// TODO: admin 验证

// GET: 获取配置
export async function GET() {
    try {
        let config = await prisma.tournamentConfig.findUnique({
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

// PUT: 更新配置 需要管理验证
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();

        // 验证必要字段
        const requiredFields = [
            'tournament_name',
            'max_pp_for_registration',
            'min_pp_for_registration',
            'current_seasonal',
            'current_category',
            'canRegister',
        ];

        for (const field of requiredFields) {
            if (data[field] === undefined) {
                return NextResponse.json(
                    { error: `缺少必要字段: ${field}` },
                    { status: 400 }
                );
            }
        }

        // 更新或创建配置
        const config = await prisma.tournamentConfig.upsert({
            where: { id: 1 },
            update: data,
            create: {
                id: 1,
                ...data,
            },
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error('更新比赛配置失败:', error);
        return NextResponse.json(
            { error: '更新配置失败' },
            { status: 500 }
        );
    }
}

// INIT: 初始化配置 仅主办使用
export async function INIT() {
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

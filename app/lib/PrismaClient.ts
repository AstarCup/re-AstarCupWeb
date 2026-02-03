import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb(
    {
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        password: process.env.DATABASE_PASSWORD || 'pwd',
        user: process.env.DATABASE_USER || 'user',
        database: process.env.DATABASE_NAME || 'database',
        connectionLimit: 5
    }
)

export const prisma = new PrismaClient({
    adapter,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
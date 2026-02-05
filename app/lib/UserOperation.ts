import { UserState,Season } from "@/app/generated/prisma/enums";
import { MultiplayerSoloRoom, Team } from "@/app/generated/prisma/client";
import { prisma } from "./PrismaClient";

export interface UserSession {
    id: number;
    userState: UserState;
    osuid: number;
    username: string;
    avatar_url?: string;
    cover_url?: string;
    country_code: string;
    pp: number;
    global_rank: number;
    country_rank: number;
    approved: number;
    seed: number;
    seasonal: Season;
    userGroups: number[];
    SoloRedPlayer?: MultiplayerSoloRoom[];
    SoloBluePlayer?: MultiplayerSoloRoom[];
    teams?: Team[];
    createdAt: Date;
    updatedAt: Date;
}

export async function CreateUser(userData: {
    osuid: number;
    username: string;
    avatar_url?: string;
    cover_url?: string;
    country_code: string;
    pp: number;
    global_rank: number | null;
    country_rank: number | null;
}): Promise<UserSession> {
    try {
        // 获取当前配置
        const config = await prisma.tournamentConfig.findUnique({
            where: { id: 1 },
        });
        
        const currentSeasonal = config?.current_seasonal || Season.S1;

        const user = await prisma.user.upsert({
            where: { osuid: userData.osuid },
            update: {
                username: userData.username,
                avatar_url: userData.avatar_url,
                cover_url: userData.cover_url,
                country_code: userData.country_code,
                pp: userData.pp,
                global_rank: userData.global_rank || 0,
                country_rank: userData.country_rank || 0,
                updatedAt: new Date(),
            },
            create: {
                osuid: userData.osuid,
                username: userData.username,
                avatar_url: userData.avatar_url,
                cover_url: userData.cover_url,
                country_code: userData.country_code,
                pp: userData.pp,
                global_rank: userData.global_rank || 0,
                country_rank: userData.country_rank || 0,
                userState: UserState.ACTIVE,
                approved: false,
                seed: 0,
                seasonal: currentSeasonal,
            },
        });

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error creating/updating user:', error);
        throw error;
    }
}

export async function getUserByOsuId(osuid: number): Promise<UserSession | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { osuid },
            include: {
                userGroups: true,
                SoloRedPlayer: true,
                SoloBluePlayer: true,
                teams: true,
            },
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: user.userGroups.map(group => group.id),
            SoloRedPlayer: user.SoloRedPlayer,
            SoloBluePlayer: user.SoloBluePlayer,
            teams: user.teams,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error getting user by osuid:', error);
        throw error;
    }
}

export async function getUserByUsername(username: string): Promise<UserSession | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                userGroups: true,
                SoloRedPlayer: true,
                SoloBluePlayer: true,
                teams: true,
            },
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: user.userGroups.map(group => group.id),
            SoloRedPlayer: user.SoloRedPlayer,
            SoloBluePlayer: user.SoloBluePlayer,
            teams: user.teams,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error getting user by username:', error);
        throw error;
    }
}

export async function updateProfile(osuid: number, updateData: {
    username?: string;
    avatar_url?: string;
    cover_url?: string;
    country_code?: string;
    pp?: number;
    global_rank?: number;
    country_rank?: number;
    userState?: UserState;
    approved?: boolean;
    seed?: number;
    seasonal?: Season;
}): Promise<UserSession> {
    try {
        const user = await prisma.user.update({
            where: { osuid },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
            include: {
                userGroups: true,
                SoloRedPlayer: true,
                SoloBluePlayer: true,
                teams: true,
            },
        });

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: user.userGroups.map(group => group.id),
            SoloRedPlayer: user.SoloRedPlayer,
            SoloBluePlayer: user.SoloBluePlayer,
            teams: user.teams,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

export async function addUserToGroup(userId: number, groupId: number): Promise<UserSession> {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                userGroups: {
                    connect: { id: groupId },
                },
                updatedAt: new Date(),
            },
            include: {
                userGroups: true,
                SoloRedPlayer: true,
                SoloBluePlayer: true,
                teams: true,
            },
        });

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: user.userGroups.map(group => group.id),
            SoloRedPlayer: user.SoloRedPlayer,
            SoloBluePlayer: user.SoloBluePlayer,
            teams: user.teams,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error adding user to group:', error);
        throw error;
    }
}

export async function removeUserFromGroup(userId: number, groupId: number): Promise<UserSession> {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                userGroups: {
                    disconnect: { id: groupId },
                },
                updatedAt: new Date(),
            },
            include: {
                userGroups: true,
                SoloRedPlayer: true,
                SoloBluePlayer: true,
                teams: true,
            },
        });

        return {
            id: user.id,
            userState: user.userState,
            osuid: user.osuid,
            username: user.username,
            avatar_url: user.avatar_url || undefined,
            cover_url: user.cover_url || undefined,
            country_code: user.country_code,
            pp: user.pp,
            global_rank: user.global_rank,
            country_rank: user.country_rank,
            approved: user.approved ? 1 : 0,
            seed: user.seed,
            seasonal: user.seasonal,
            userGroups: user.userGroups.map(group => group.id),
            SoloRedPlayer: user.SoloRedPlayer,
            SoloBluePlayer: user.SoloBluePlayer,
            teams: user.teams,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    } catch (error) {
        console.error('Error removing user from group:', error);
        throw error;
    }
}

export async function getUserGroups(userId: number): Promise<number[]> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userGroups: true,
            },
        });

        if (!user) {
            return [];
        }

        return user.userGroups.map(group => group.id);
    } catch (error) {
        console.error('Error getting user groups:', error);
        throw error;
    }
}
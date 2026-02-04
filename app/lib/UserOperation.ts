import { UserState } from "@/app/generated/prisma/enums";
import { MultiplayerSoloRoom, Team } from "@/app/generated/prisma/client";

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
    seasonal: number;
    userGroups: number[];
    SoloRedPlayer?: MultiplayerSoloRoom[];
    SoloBluePlayer?: MultiplayerSoloRoom[];
    teams?: Team[];
    createdAt: Date;
    updatedAt: Date;
}

export async function CreateUser(user:UserSession) {
    
}
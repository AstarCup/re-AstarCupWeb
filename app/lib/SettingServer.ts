import { prisma } from "@/app/lib/PrismaClient";
import { Season, Category } from "@/app/generated/prisma/enums";

export interface Config {
    tournament_name?: string;
    max_pp_for_registration?: number;
    min_pp_for_registration?: number;
    current_seasonal?: Season
    current_category?: Category
    canRegister?: boolean;
}

export async function getServerSideConfig() {
    const config = await prisma.tournamentConfig.findUnique({
        where: { id: 1 },
    });
    return config;
}

export async function setServerSideConfig(settings: Config) {
    const updatedConfig = await prisma.tournamentConfig.update({
        where: { id: 1 },
        data: {
            tournament_name: settings.tournament_name,
            max_pp_for_registration: settings.max_pp_for_registration,
            min_pp_for_registration: settings.min_pp_for_registration,
            current_seasonal: settings.current_seasonal,
            current_category: settings.current_category,
            canRegister: settings.canRegister,
        },
    });
    return updatedConfig;
}
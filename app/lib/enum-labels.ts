import { useMemo } from 'react';
import { Season, Category } from '@/app/generated/prisma/enums';

interface EnumOption<T> {
    value: T;
    label: string;
}

const enumLabels = {
    Season: {
        [Season.S1]: 'S1',
        [Season.S2]: 'S2',
    },
    Category: {
        [Category.QUA]: '资格赛QUA',
        [Category.RO16]: 'RO16',
        [Category.QF]: '四分之一决赛QF',
        [Category.SF]: '半决赛SF',
        [Category.F]: '决赛F',
        [Category.GF]: '总决赛GF',
    },
};

export function useEnumOptions<T extends string>(
    enumType: keyof typeof enumLabels,
    enumValues: readonly T[]
): EnumOption<T>[] {
    return useMemo(() => {
        const labels = enumLabels[enumType] as Record<string, string>;
        return enumValues.map(value => ({
            value,
            label: labels[value] || value,
        }));
    }, [enumType, enumValues]);
}

export function useSeasonOptions() {
    return useEnumOptions('Season', Object.values(Season));
}

export function useCategoryOptions() {
    return useEnumOptions('Category', Object.values(Category));
}
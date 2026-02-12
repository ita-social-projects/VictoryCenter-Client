import { ProgramAllocationItem } from '@/pages/public/reports-page/components/summary-section/programs-allocation-chart/ProgramsAllocationChart';

interface LayoutBlock {
    label: string;
    amount: number;
    flexGrow: number;
    variant: number;
}

interface LayoutColumn {
    widthPercent: number;
    blocks: LayoutBlock[];
}

const LAYOUT_PATTERNS: Record<number, number[][]> = {
    1: [[0]],
    2: [[0], [1]],
    3: [[0], [1, 2]],
    4: [[0], [1, 2], [3]],
};

const mapToBlock = (item: ProgramAllocationItem, variant: number): LayoutBlock => ({
    label: item.label,
    amount: item.amount,
    flexGrow: item.amount,
    variant,
});

export const resolveProgramsLayout = (items: ProgramAllocationItem[]): LayoutColumn[] => {
    const pattern = LAYOUT_PATTERNS[items.length];
    if (!pattern) return [];

    const total = items.reduce((sum, item) => sum + item.amount, 0);
    if (total === 0) return [];

    return pattern.map((group) => {
        const groupAmount = group.reduce((sum, index) => sum + items[index].amount, 0);

        return {
            widthPercent: (groupAmount / total) * 100,
            blocks: group.map((index) => mapToBlock(items[index], index)),
        };
    });
};

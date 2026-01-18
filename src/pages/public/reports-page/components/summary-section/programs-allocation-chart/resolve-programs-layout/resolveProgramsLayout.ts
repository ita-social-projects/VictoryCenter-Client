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

export const resolveProgramsLayout = (items: ProgramAllocationItem[]): LayoutColumn[] => {
    const total = items.reduce((s, i) => s + i.amount, 0);

    if (items.length === 2) {
        return items.map((item, index) => ({
            widthPercent: (item.amount / total) * 100,
            blocks: [
                {
                    label: item.label,
                    amount: item.amount,
                    flexGrow: item.amount,
                    variant: index === 0 ? 0 : 1,
                },
            ],
        }));
    }

    if (items.length === 3) {
        const [first, second, third] = items;

        return [
            {
                widthPercent: (first.amount / total) * 100,
                blocks: [
                    {
                        label: first.label,
                        amount: first.amount,
                        flexGrow: first.amount,
                        variant: 0,
                    },
                ],
            },
            {
                widthPercent: ((second.amount + third.amount) / total) * 100,
                blocks: [
                    {
                        label: second.label,
                        amount: second.amount,
                        flexGrow: second.amount,
                        variant: 1,
                    },
                    {
                        label: third.label,
                        amount: third.amount,
                        flexGrow: third.amount,
                        variant: 2,
                    },
                ],
            },
        ];
    }

    const [first, second, third, fourth] = items;

    return [
        {
            widthPercent: (first.amount / total) * 100,
            blocks: [
                {
                    label: first.label,
                    amount: first.amount,
                    flexGrow: first.amount,
                    variant: 0,
                },
            ],
        },
        {
            widthPercent: ((second.amount + third.amount) / total) * 100,
            blocks: [
                {
                    label: second.label,
                    amount: second.amount,
                    flexGrow: second.amount,
                    variant: 1,
                },
                {
                    label: third.label,
                    amount: third.amount,
                    flexGrow: third.amount,
                    variant: 2,
                },
            ],
        },
        {
            widthPercent: (fourth.amount / total) * 100,
            blocks: [
                {
                    label: fourth.label,
                    amount: fourth.amount,
                    flexGrow: fourth.amount,
                    variant: 3,
                },
            ],
        },
    ];
};

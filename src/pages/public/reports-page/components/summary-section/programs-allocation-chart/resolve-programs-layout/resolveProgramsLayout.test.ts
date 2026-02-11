import { resolveProgramsLayout } from './resolveProgramsLayout';

const createItem = (amount: number, label = 'test') => ({
    label,
    amount,
});

describe('resolveProgramsLayout', () => {
    describe('invalid input', () => {
        it('should return empty array when no pattern exists', () => {
            expect(resolveProgramsLayout([])).toEqual([]);
            expect(resolveProgramsLayout(new Array(5).fill(createItem(100)))).toEqual([]);
        });

        it('should return empty array when total amount is zero', () => {
            const items = [createItem(0), createItem(0)];
            expect(resolveProgramsLayout(items)).toEqual([]);
        });
    });

    describe('1 item', () => {
        it('should resolve layout correctly', () => {
            const items = [createItem(500)];
            const result = resolveProgramsLayout(items);

            expect(result).toHaveLength(1);
            expect(result[0].widthPercent).toBeCloseTo(100);
            expect(result[0].blocks).toHaveLength(1);
            expect(result[0].blocks[0]).toMatchObject({
                amount: 500,
                variant: 0,
            });
        });
    });

    describe('2 items', () => {
        it('should resolve layout correctly', () => {
            const items = [createItem(250), createItem(750)];
            const result = resolveProgramsLayout(items);

            expect(result).toHaveLength(2);

            expect(result[0].widthPercent).toBeCloseTo(25);
            expect(result[1].widthPercent).toBeCloseTo(75);

            expect(result[0].blocks[0].variant).toBe(0);
            expect(result[1].blocks[0].variant).toBe(1);
        });
    });

    describe('3 items', () => {
        it('should group last two items into second column', () => {
            const items = [createItem(200), createItem(300), createItem(500)];

            const result = resolveProgramsLayout(items);

            expect(result).toHaveLength(2);

            expect(result[0].widthPercent).toBeCloseTo(20);
            expect(result[1].widthPercent).toBeCloseTo(80);

            expect(result[0].blocks).toHaveLength(1);
            expect(result[1].blocks).toHaveLength(2);

            expect(result[1].blocks[0]).toMatchObject({
                amount: 300,
                variant: 1,
            });

            expect(result[1].blocks[1]).toMatchObject({
                amount: 500,
                variant: 2,
            });
        });
    });

    describe('4 items', () => {
        it('should group middle two items into second column', () => {
            const items = [createItem(100), createItem(200), createItem(300), createItem(400)];

            const result = resolveProgramsLayout(items);

            expect(result).toHaveLength(3);

            expect(result[0].widthPercent).toBeCloseTo(10);
            expect(result[1].widthPercent).toBeCloseTo(50);
            expect(result[2].widthPercent).toBeCloseTo(40);

            expect(result[1].blocks).toHaveLength(2);

            expect(result[1].blocks[0].variant).toBe(1);
            expect(result[1].blocks[1].variant).toBe(2);
            expect(result[2].blocks[0].variant).toBe(3);
        });
    });
});

import { resolveProgramsLayout } from './resolveProgramsLayout';

const createItem = (amount: number) => ({
    label: 'test',
    amount,
});

describe('resolveProgramsLayout', () => {
    it('should return empty array for invalid number of items', () => {
        expect(resolveProgramsLayout([])).toEqual([]);
        expect(resolveProgramsLayout([createItem(100)])).toEqual([]);
        expect(resolveProgramsLayout(new Array(5).fill(createItem(100)))).toEqual([]);
    });

    it('should resolve layout for 2 items correctly', () => {
        const items = [createItem(250), createItem(750)];
        const result = resolveProgramsLayout(items);

        expect(result).toHaveLength(2);
        expect(result[0].widthPercent).toBeCloseTo(25);
        expect(result[1].widthPercent).toBeCloseTo(75);
        expect(result[0].blocks[0].variant).toBe(0);
        expect(result[1].blocks[0].variant).toBe(1);
    });

    it('should resolve layout for 3 items correctly', () => {
        const items = [createItem(200), createItem(300), createItem(500)];
        const result = resolveProgramsLayout(items);

        expect(result).toHaveLength(2);
        expect(result[0].widthPercent).toBeCloseTo(20);
        expect(result[1].widthPercent).toBeCloseTo(80);

        expect(result[0].blocks).toHaveLength(1);
        expect(result[1].blocks).toHaveLength(2);

        expect(result[1].blocks[0].amount).toBe(300);
        expect(result[1].blocks[1].amount).toBe(500);
    });

    it('should resolve layout for 4 items correctly', () => {
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

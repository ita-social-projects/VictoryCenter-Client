/**
 *   (1, 21, 31…)   "категорія"
 *   (2–4, 22–24…)  "категорії"
 *   (0, 5–20, 25…) "категорій"
 */
export const getUkrainianPlural = (count: number, forms: string[]): string => {
    const mod10 = Math.abs(count) % 10;
    const mod100 = Math.abs(count) % 100;

    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
};

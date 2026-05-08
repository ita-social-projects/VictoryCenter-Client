export const normalizeForUnique = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .sort((a, b) => a.localeCompare(b))
        .join(' ');

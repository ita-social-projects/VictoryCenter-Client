export const generateInitials = (fullName: string, maxInitials: number = 2): string => {
    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, maxInitials)
        .map((name) => name[0])
        .join('')
        .toUpperCase();
};

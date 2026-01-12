export const generateInitials = (fullName: string, maxInitials: number = 2): string => {
    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, maxInitials)
        .map((name) => name[0])
        .join('')
        .toUpperCase();
};

export const getNormalizedInputText = (text: string, prefix = ''): string =>
    text.slice(prefix.length).trim().replace(/\s+/g, ' ');

export const getTrimmedInputText = (text: string, prefix = ''): string => text.slice(prefix.length).trim();

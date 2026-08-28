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

export const getNormalizedInputTextWhileTyping = (text: string): string => text.replace(/\s+/g, ' ').trimStart();

export const getTrimmedInputText = (text: string, prefix = ''): string => text.slice(prefix.length).trim();

export const parseDescriptionList = (description?: string) => {
    if (!description) return { intro: null, items: [] };

    const lines = description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length === 0) return { intro: null, items: [] };

    const hasIntro = lines[0].endsWith(':');

    return {
        intro: hasIntro ? lines[0] : null,
        items: (hasIntro ? lines.slice(1) : lines).map((item) => item.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean),
    };
};

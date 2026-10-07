export const isExternalLink = (href: string): boolean => {
    return /^(https?:\/\/|mailto:|tel:)/.test(href);
};

export const isHttpOrHttpsUrl = (value: string | null | undefined): boolean => {
    if (!value) return false;

    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

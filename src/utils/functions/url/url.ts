export const isExternalLink = (href: string): boolean => {
    return /^(https?:\/\/|mailto:|tel:)/.test(href);
};

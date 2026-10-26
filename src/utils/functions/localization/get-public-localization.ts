export const getPublicLocalization = <T extends { language?: { code: string } | null }>(
    items: T[] | null | undefined,
    languageCode: string,
): T | null => items?.find((item) => item.language?.code?.toLowerCase() === languageCode.toLowerCase()) ?? null;

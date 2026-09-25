export const validateCharacterLimitRealTime = (value: string, max: number, maxError: string): string | undefined => {
    const normalised = value.replace(/\s+/g, ' ').trimStart();
    if (normalised.length > max) return maxError;
    return undefined;
};

export const validateCharacterLimitOnBlur = (
    value: string,
    min: number,
    max: number,
    requiredError: string,
    minError: string,
    maxError: string,
): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return requiredError;
    if (trimmed.length < min) return minError;
    if (trimmed.length > max) return maxError;
    return undefined;
};

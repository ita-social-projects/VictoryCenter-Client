export const formatDate = (isoDate: string): string => {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
};

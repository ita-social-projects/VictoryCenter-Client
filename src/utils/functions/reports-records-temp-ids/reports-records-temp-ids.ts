let tempIdCounter = 0;

export const getTempId = (): number => {
    tempIdCounter += 1;
    return -tempIdCounter;
};

export const isTempId = (id: number): boolean => id < 0;

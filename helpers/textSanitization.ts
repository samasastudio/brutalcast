export const getCharReplacement = (char: string): string => {
    const replacements = new Map([
        ['°', ' degrees '],
        ['–', '-'],
        ['—', '-'],
        ['"', '"'],
        ['"', '"'],
        ["'", "'"],
        ["'", "'"],
    ]);
    return replacements.get(char) || '';
};

export const sanitizeString = (str: string): string => {
    return str.replace(/[^\x00-\x7F]/g, getCharReplacement);
};

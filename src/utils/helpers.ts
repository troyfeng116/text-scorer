const charCodeToIndexMap: { [key: number]: number } = {
    97: 0,
    98: 1,
    99: 2,
    100: 3,
    101: 4,
    102: 5,
    103: 6,
    104: 7,
    105: 8,
    106: 9,
    107: 10,
    108: 11,
    109: 12,
    110: 13,
}

export const isAlphaOrSpace = (charCode: number): boolean => {
    return (97 <= charCode && charCode <= 122) || charCode == 32
}

export const charCodeToIndex = (charCode: number): number => {
    if (charCode === 32) return 26
    return charCode - 97
}

export const cleanTrainingText = (text: string): string => {
    return text.toLowerCase().replace(/\.|\?|\!|\,|\&/gi, '')
}

export const cleanTextToScore = (text: string): string => {
    return text.toLowerCase().replace(/\s{2,}/gi, ' ')
}

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

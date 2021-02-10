export const isAlphaOrSpace = (charCode: number): boolean => {
    return (97 <= charCode && charCode <= 122) || charCode == 32
}

export const charCodeToIndex = (charCode: number): number => {
    if (charCode === 32) return 26
    return charCode - 97
}

// To do: clean training text based on allowed chars
export const cleanTrainingText = (text: string): string => {
    return text.toLowerCase().replace(/\.|\?|\!|\,|\&/gi, '')
}

// To do: clean text based on allowed chars?
export const cleanTextToScore = (text: string): string => {
    return text.toLowerCase().replace(/\s{2,}/gi, ' ')
}

// Let S = {unique chars : charsToIncludeStr}. Returns { charCodeMap: S -> [0,1,2,...,|S|-1], uniqueChars: |S| }
export const getCharCodeMap = (charsToIncludeStr: string): { charCodeMap: { [key: number]: number }; uniqueChars: number } => {
    const charCodeMap: { [key: number]: number } = {}
    let index = 0
    for (let i = 0; i < charsToIncludeStr.length; i++) {
        const c = charsToIncludeStr.charCodeAt(i)
        if (charCodeMap[c] !== undefined) continue
        charCodeMap[c] = index
        index++
    }
    return { charCodeMap: charCodeMap, uniqueChars: index }
}

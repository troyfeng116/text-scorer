export const cleanTrainingText = (text: string, charsToInclude: string, ignoreCase: boolean): string => {
    if (ignoreCase) return text.toLowerCase().replace(new RegExp(`[^${charsToInclude}]`, 'gi'), '')
    return text.replace(new RegExp(`[^${charsToInclude}]`, 'gi'), '')
}

export const cleanTextToScore = (text: string, ignoreCase: boolean): string => {
    if (ignoreCase) return text.toLowerCase().replace(/\s{2,}/gi, ' ')
    return text.replace(/\s{2,}/gi, ' ')
}

// Let S = {unique chars : charsToIncludeStr}. Returns { charCodeMap: S -> [0,1,2,...,|S|-1], uniqueChars: |S|, noDuplicateCharsStr: string }
export const getCharCodeMap = (charsToIncludeStr: string): { charCodeMap: { [key: number]: number }; uniqueChars: number; noDuplicateCharsStr: string } => {
    const charCodeMap: { [key: number]: number } = {}
    let index = 0
    let noDuplicateCharsStr = ''
    for (let i = 0; i < charsToIncludeStr.length; i++) {
        const c = charsToIncludeStr.charCodeAt(i)
        if (charCodeMap[c] !== undefined) continue
        charCodeMap[c] = index
        index++
        noDuplicateCharsStr += String.fromCharCode(c)
    }
    return { charCodeMap: charCodeMap, uniqueChars: index, noDuplicateCharsStr: noDuplicateCharsStr }
}

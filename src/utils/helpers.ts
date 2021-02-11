import { DEFAULT_CHARS_TO_INCLUDE } from './constants'

// To do: add ignoreCase
export const cleanTrainingText = (text: string, allowedChars = DEFAULT_CHARS_TO_INCLUDE): string => {
    return text.toLowerCase().replace(new RegExp(`[^${allowedChars}]`, 'gi'), '')
}

// To do: add ignoreCase
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

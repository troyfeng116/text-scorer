import { CutoffScore } from '..'
import { BigramMatrixRow } from '../bigram/BigramMatrix'
import { TrigramMatrixLayer } from '../trigram/TrigramMatrix'
import { DEFAULT_BIGRAM_MATRIX_JSON, DEFAULT_TRIGRAM_MATRIX_JSON } from './constants'

export const cleanTrainingText = (text: string, charsToInclude: string, ignoreCase: boolean): string => {
    const map: boolean[] = new Array(256)
    for (let i = 0; i < 256; i++) map[i] = false
    for (let i = 0; i < charsToInclude.length; i++) {
        map[charsToInclude.charCodeAt(i)] = true
    }
    if (ignoreCase) text = text.toLowerCase()
    let cleanText = ''
    for (let i = 0; i < text.length; i++) {
        if (map[text.charCodeAt(i)] === true) cleanText += text[i]
    }
    return cleanText
}

export const cleanTextToScore = (text: string, ignoreCase: boolean): string => {
    if (ignoreCase) return text.toLowerCase().replace(/\s{2,}/gi, ' ')
    return text.replace(/\s{2,}/gi, ' ')
}

export const cleanAndExtractWordsFromTextToScore = (text: string, ignoreCase: boolean): string[] => {
    return cleanTextToScore(text, ignoreCase).split(/[^a-zA-Z\'\-]/gi)
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

export const getDefaultBigramMatrixFromJSON = (): {
    bigramMatrix: BigramMatrixRow[]
    cutoffScores: CutoffScore
} => {
    return JSON.parse(DEFAULT_BIGRAM_MATRIX_JSON)
}

export const getDefaultTrigramMatrixFromJSON = (): {
    trigramMatrix: TrigramMatrixLayer[]
    cutoffScores: CutoffScore
} => {
    return JSON.parse(DEFAULT_TRIGRAM_MATRIX_JSON)
}

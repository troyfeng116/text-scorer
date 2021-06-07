import { CutoffScore } from '..'
import { BigramMatrixRow } from '../bigram/BigramMatrix'
import { TrigramMatrixLayer } from '../trigram/TrigramMatrix'
import { DEFAULT_BIGRAM_MATRIX_JSON, DEFAULT_TRIGRAM_MATRIX_JSON } from './constants'

/**
 * Given uncleaned `text` string, removes excluded chars to prepare for training.
 * @param text Uncleaned training corpus string.
 * @param charsToInclude String containing all chars to be included as matrix nodes.
 * @param ignoreCase Indicates whether `text` should be converted to lower case before processing.
 * @returns Cleaned training corpus ready to be used for training.
 */
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

/**
 * Given uncleaned `text` string, replaces consecutive spaces to reduce noise to prepare for scoring.
 * @param text Uncleaned query string.
 * @param ignoreCase Indicates whether `text` should be converted to lower case before processing.
 * @returns Cleaned query string ready to be passed to model for scoring.
 */
export const cleanTextToScore = (text: string, ignoreCase: boolean): string => {
    if (ignoreCase) return text.toLowerCase().replace(/\s{2,}/gi, ' ')
    return text.replace(/\s{2,}/gi, ' ')
}

/**
 * Given uncleaned `text` string, cleans text for scoring and returns array of word tokens.
 * For use in word-by-word analysis `TextScorer` functions.
 * @param text Uncleaned query string.
 * @param ignoreCase Indicates whether `text` should be converted to lower case before processing.
 * @returns Array of strings corresponding to extracted word tokens.
 */
export const cleanAndExtractWordsFromTextToScore = (text: string, ignoreCase: boolean): string[] => {
    return cleanTextToScore(text, ignoreCase).split(/[^a-zA-Z\'\-]/gi)
}

/**
 * Given string of chars to include in processing, returns a dict mapping char codes to matrix indices.
 *
 * Also returns the number of unique chars, and a string containing only unique chars.
 *
 * Let set `S = {unique chars : charsToIncludeStr}`. Returns `{ charCodeMap: S -> [0,1,2,...,|S|-1], uniqueChars: |S|, noDuplicateCharsStr: string }`
 * @param charsToIncludeStr String containing chars to be included in matrices and in processing.
 * @returns Object containing the following fields:
 *      - `charCodeMap`: dict mapping unique chars occurring in `charsToIncludeStr` to matrix indices
 *      - `uniqueChars`: number of unique chars found in `charsToIncludeStr`
 *      - `noDuplicateCharsStr`: subsequence of `charsToIncludeStr` containing only unique chars
 */
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

/**
 * Retrieve hard-coded baseline bigram matrix and cutoff scores pre-calculated with default inputs and stored as stringified JSON.
 *
 * Optimizes `BigramMatrix` initialization with default options.
 * @returns `bigramMatrix` (array of rows) and `cutoffScores`.
 */
export const getDefaultBigramMatrixFromJSON = (): {
    bigramMatrix: BigramMatrixRow[]
    cutoffScores: CutoffScore
} => {
    return JSON.parse(DEFAULT_BIGRAM_MATRIX_JSON)
}

/**
 * Retrieve hard-coded baseline trigram matrix and cutoff scores pre-calculated with default inputs and stored as stringified JSON.
 *
 * Optimizes `TrigramMatrix` initialization with default options.
 * @returns `trigramMatrix` (array of 2D array layers) and `cutoffScores`.
 */
export const getDefaultTrigramMatrixFromJSON = (): {
    trigramMatrix: TrigramMatrixLayer[]
    cutoffScores: CutoffScore
} => {
    return JSON.parse(DEFAULT_TRIGRAM_MATRIX_JSON)
}

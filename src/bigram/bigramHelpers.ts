import { cleanTextToScore, cleanTrainingText } from '../utils/helpers'
import { BigramMatrixRow } from './BigramMatrix'
import { CutoffScore } from '..'

/**
 * Given `n` (size of character space), returns Laplace-smoothed (`d = 1`) bigram frequency matrix.
 *
 * Sets up matrix to track all `n`x`n` bigram transition frequencies.
 * @param n Number of characters (dimension) of array.
 * @returns Initial `n`x`n` matrix (array of matrix rows), Laplace smoothed.
 */
export const createEmptyBigramMatrix = (n: number): BigramMatrixRow[] => {
    const matrix: BigramMatrixRow[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countRow: new Array<number>(n), rowTotal: n }
        for (let j = 0; j < n; j++) {
            matrix[i].countRow[j] = 1
        }
    }
    return matrix
}

/**
 * Process character bigrams in text input and update counts of each bigram in `bigramMatrix`.
 * @param bigramMatrix `n`x`n` matrix storing frequencies of all bigrams.
 * @param text Training corpus.
 * @param charCodeMap Mapping of `charsToInclude` to index `[0,n]` in matrix.
 * @param charsToInclude String indicating set of characters to consider from training text.
 * @param ignoreCase Indicates whether training text should be converted to lower case.
 */
export const trainBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string, charCodeMap: { [key: number]: number }, charsToInclude: string, ignoreCase: boolean): void => {
    const cleanText = cleanTrainingText(text, charsToInclude, ignoreCase)
    for (let i = 0; i < cleanText.length - 1; i++) {
        const u = charCodeMap[cleanText.charCodeAt(i)]
        const v = charCodeMap[cleanText.charCodeAt(i + 1)]
        if (u !== undefined && v !== undefined) {
            bigramMatrix[u].countRow[v]++
            bigramMatrix[u].rowTotal++
        }
    }
}

/**
 * Given text query string, returns score for query by processing character bigrams in query and running bigrams through `bigramMatrix`.
 * Returns average bigram occurrence probability to normalize over query length.
 *
 * Note that this function uses log probabilities during calculation to prevent numerical underflow.
 * @param bigramMatrix `n`x`n` matrix storing frequencies of all bigrams.
 * @param text Query string.
 * @param charCodeMap Mapping of `charsToInclude` to index `[0,n]` in matrix.
 * @param ignoreCase Indicates whether query text should be converted to lower case.
 * @returns Score for text query corresponding to average bigram occurrence probability.
 */
export const runTextThroughBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string, charCodeMap: { [key: number]: number }, ignoreCase: boolean): number => {
    const cleanText = cleanTextToScore(text, ignoreCase)
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < cleanText.length - 1; i++) {
        const u = charCodeMap[cleanText.charCodeAt(i)]
        const v = charCodeMap[cleanText.charCodeAt(i + 1)]
        if (u !== undefined && v !== undefined) {
            numerator += Math.log(bigramMatrix[u].countRow[v] / bigramMatrix[u].rowTotal)
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

/**
 * Utilizes provided corpus of good and bad sample text to learn predicted cutoff scores at three levels of strictness.
 * @param bigramMatrix `n`x`n` matrix storing frequencies of all bigrams.
 * @param goodText Well-formed text samples.
 * @param badText Gibberish-y text samples.
 * @param charCodeMap Mapping of `charsToInclude` to indices `[0,n]` in matrix.
 * @param ignoreCase Indicates whether samples should be converted to lower case before processing.
 * @returns `CutoffScore` object containing cutoff scores at `strict`, `loose`, and `avg` levels based on `min` and `max` extraction from sample scores.
 */
export const getBigramCutoffScores = (bigramMatrix: BigramMatrixRow[], goodText: string[], badText: string[], charCodeMap: { [key: number]: number }, ignoreCase: boolean): CutoffScore => {
    const goodScores = goodText.map((good) => runTextThroughBigramMatrix(bigramMatrix, good, charCodeMap, ignoreCase))
    const badScores = badText.map((bad) => runTextThroughBigramMatrix(bigramMatrix, bad, charCodeMap, ignoreCase))
    let minGoodScore = Number.POSITIVE_INFINITY
    for (const goodScore of goodScores) minGoodScore = Math.min(minGoodScore, goodScore)
    let maxBadScore = 0
    for (const badScore of badScores) maxBadScore = Math.max(maxBadScore, badScore)
    return { loose: Math.min(minGoodScore, maxBadScore), avg: (minGoodScore + maxBadScore) / 2, strict: Math.max(minGoodScore, maxBadScore) }
}

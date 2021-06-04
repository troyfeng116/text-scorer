import { CutoffScore } from '..'
import { cleanTextToScore, cleanTrainingText } from '../utils/helpers'
import { TrigramMatrixLayer } from './TrigramMatrix'

/**
 * Given `n` (size of character space), returns Laplace-smoothed (`d = 1`) trigram frequency matrix.
 *
 * Sets up matrix to track all `n`x`n`x`n` trigram transition frequencies.
 * @param n Number of characters (dimension) of array.
 * @returns Initial `n`x(`n`x`n`) matrix (array of `n`x`n` matrix layers), Laplace smoothed.
 */
export const createEmptyTrigramMatrix = (n: number): TrigramMatrixLayer[] => {
    const matrix: TrigramMatrixLayer[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countLayer: new Array<Array<number>>(n), layerTotal: n * n }
        for (let j = 0; j < n; j++) {
            matrix[i].countLayer[j] = new Array<number>(n)
            for (let k = 0; k < n; k++) {
                matrix[i].countLayer[j][k] = 1
            }
        }
    }
    return matrix
}

/**
 * Process character trigrams in text input and update counts of each trigram in `trigramMatrix`.
 * @param trigramMatrix `n`x(`n`x`n`) matrix storing frequencies of all trigrams.
 * @param text Training corpus.
 * @param charCodeMap Mapping of `charsToInclude` to index `[0,n]` in matrix.
 * @param charsToInclude String indicating set of characters to consider from training text.
 * @param ignoreCase Indicates whether training text should be converted to lower case.
 */
export const trainTrigramMatrix = (trigramMatrix: TrigramMatrixLayer[], text: string, charCodeMap: { [key: number]: number }, charsToInclude: string, ignoreCase: boolean): void => {
    const cleanText = cleanTrainingText(text, charsToInclude, ignoreCase)
    for (let i = 0; i < cleanText.length - 2; i++) {
        const u = charCodeMap[cleanText.charCodeAt(i)]
        const v = charCodeMap[cleanText.charCodeAt(i + 1)]
        const w = charCodeMap[cleanText.charCodeAt(i + 2)]
        if (u !== undefined && v !== undefined && w !== undefined) {
            trigramMatrix[u].countLayer[v][w]++
            trigramMatrix[u].layerTotal++
        }
    }
}

/**
 * Given text query string, returns score for query by processing character trigrams in query and running trigrams through `trigramMatrix`.
 * Returns average trigram occurrence probability to normalize over query length.
 *
 * Note that this function uses log probabilities during calculation to prevent numerical underflow.
 * @param trigramMatrix `n`x(`n`x`n`) matrix storing frequencies of all trigrams.
 * @param text Query string.
 * @param charCodeMap Mapping of `charsToInclude` to index `[0,n]` in matrix.
 * @param ignoreCase Indicates whether query text should be converted to lower case.
 * @returns Score for text query corresponding to average trigram occurrence probability.
 */
export const runTextThroughTrigramMatrix = (trigramMatrix: TrigramMatrixLayer[], text: string, charCodeMap: { [key: number]: number }, ignoreCase: boolean): number => {
    const cleanText = cleanTextToScore(text, ignoreCase)
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < cleanText.length - 2; i++) {
        const u = charCodeMap[cleanText.charCodeAt(i)]
        const v = charCodeMap[cleanText.charCodeAt(i + 1)]
        const w = charCodeMap[cleanText.charCodeAt(i + 2)]
        if (u !== undefined && v !== undefined && w !== undefined) {
            numerator += Math.log(trigramMatrix[u].countLayer[v][w] / trigramMatrix[u].layerTotal)
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

/**
 * Utilizes provided corpus of good and bad sample text to learn predicted cutoff scores at three levels of strictness.
 * @param trigramMatrix `n`x(`n`x`n`) matrix storing frequencies of all trigrams.
 * @param goodText Well-formed text samples.
 * @param badText Gibberish-y text samples.
 * @param charCodeMap Mapping of `charsToInclude` to indices `[0,n]` in matrix.
 * @param ignoreCase Indicates whether samples should be converted to lower case before processing.
 * @returns `CutoffScore` object containing cutoff scores at `strict`, `loose`, and `avg` levels based on `min` and `max` extraction from sample scores.
 */
export const getTrigramCutoffScores = (trigramMatrix: TrigramMatrixLayer[], goodText: string[], badText: string[], charCodeMap: { [key: number]: number }, ignoreCase: boolean): CutoffScore => {
    const goodScores = goodText.map((good) => runTextThroughTrigramMatrix(trigramMatrix, good, charCodeMap, ignoreCase))
    const badScores = badText.map((bad) => runTextThroughTrigramMatrix(trigramMatrix, bad, charCodeMap, ignoreCase))
    let minGoodScore = Number.POSITIVE_INFINITY
    for (const goodScore of goodScores) minGoodScore = Math.min(minGoodScore, goodScore)
    let maxBadScore = 0
    for (const badScore of badScores) maxBadScore = Math.max(maxBadScore, badScore)
    return { loose: Math.min(minGoodScore, maxBadScore), avg: (minGoodScore + maxBadScore) / 2, strict: Math.max(minGoodScore, maxBadScore) }
}

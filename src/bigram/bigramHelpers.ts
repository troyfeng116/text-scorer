import { cleanTextToScore, cleanTrainingText } from '../utils/helpers'
import { BigramMatrixRow } from './BigramMatrix'
import { CutoffScore } from '..'

// Create n x n matrix for all n x n transition counts
export const createEmptyBigramMatrix = (n: number): BigramMatrixRow[] => {
    const matrix: BigramMatrixRow[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countRow: new Array<number>(n).fill(1), rowTotal: n }
    }
    return matrix
}

// Process character bigrams in text, store counts of each bigram in bigramMatrix
export const trainBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string, charCodeMap: { [key: number]: number }): void => {
    const cleanText = cleanTrainingText(text)
    for (let i = 0; i < cleanText.length - 1; i++) {
        const u = charCodeMap[cleanText.charCodeAt(i)]
        const v = charCodeMap[cleanText.charCodeAt(i + 1)]
        if (u !== undefined && v !== undefined) {
            bigramMatrix[u].countRow[v]++
            bigramMatrix[u].rowTotal++
        }
    }
}

// Process character bigrams in text, run bigrams through bigramMatrix and calculate average probability to normalize by length.
// Log probabilities to prevent underflow
export const runTextThroughBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string, charCodeMap: { [key: number]: number }): number => {
    const cleanText = cleanTextToScore(text)
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

// Calculate predicted expected cutoff scores (three levels of strictness)
export const getBigramCutoffScores = (bigramMatrix: BigramMatrixRow[], goodText: string[], badText: string[], charCodeMap: { [key: number]: number }): CutoffScore => {
    const goodScores = goodText.map((good) => runTextThroughBigramMatrix(bigramMatrix, good, charCodeMap))
    const badScores = badText.map((bad) => runTextThroughBigramMatrix(bigramMatrix, bad, charCodeMap))
    let minGoodScore = Number.POSITIVE_INFINITY
    for (const goodScore of goodScores) minGoodScore = Math.min(minGoodScore, goodScore)
    let maxBadScore = 0
    for (const badScore of badScores) maxBadScore = Math.max(maxBadScore, badScore)
    return { low: Math.min(minGoodScore, maxBadScore), med: (minGoodScore + maxBadScore) / 2, hi: Math.max(minGoodScore, maxBadScore) }
}

import { CutoffScore } from '..'
import { cleanTextToScore, cleanTrainingText } from '../utils/helpers'
import { TrigramMatrixLayer } from './TrigramMatrix'

// Create n x (n x n) matrix for all n x n x n transition counts
export const createEmptyTrigramMatrix = (n: number): TrigramMatrixLayer[] => {
    const matrix: TrigramMatrixLayer[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countLayer: new Array<Array<number>>(n), layerTotal: n * n }
        for (let j = 0; j < n; j++) {
            matrix[i].countLayer[j] = new Array(n).fill(1)
        }
    }
    return matrix
}

// Process character trigrams in text, store counts of each trigram in trigramMatrix
export const trainTrigramMatrix = (trigramMatrix: TrigramMatrixLayer[], text: string, charCodeMap: { [key: number]: number }): void => {
    const cleanText = cleanTrainingText(text)
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

// Process character trigrams in text, run trigrams through trigramMatrix and calculate average probability to normalize by length.
// Log probabilities to prevent underflow
export const runTextThroughTrigramMatrix = (trigramMatrix: TrigramMatrixLayer[], text: string, charCodeMap: { [key: number]: number }): number => {
    const cleanText = cleanTextToScore(text)
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

// Calculate predicted expected cutoff scores (three levels of strictness)
export const getTrigramCutoffScores = (trigramMatrix: TrigramMatrixLayer[], goodText: string[], badText: string[], charCodeMap: { [key: number]: number }): CutoffScore => {
    const goodScores = goodText.map((good) => runTextThroughTrigramMatrix(trigramMatrix, good, charCodeMap))
    const badScores = badText.map((bad) => runTextThroughTrigramMatrix(trigramMatrix, bad, charCodeMap))
    let minGoodScore = Number.POSITIVE_INFINITY
    for (const goodScore of goodScores) minGoodScore = Math.min(minGoodScore, goodScore)
    let maxBadScore = 0
    for (const badScore of badScores) maxBadScore = Math.max(maxBadScore, badScore)
    console.log(goodScores, badScores)
    return { loose: Math.min(minGoodScore, maxBadScore), avg: (minGoodScore + maxBadScore) / 2, strict: Math.max(minGoodScore, maxBadScore) }
}

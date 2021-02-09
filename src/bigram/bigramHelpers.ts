import { ALPHA_SIZE } from '../utils/constants'
import { charCodeToIndex, cleanTextToScore, cleanTrainingText, isAlphaOrSpace } from '../utils/helpers'
import { BigramMatrixCutoffs, BigramMatrixRow } from './BigramMatrix'

// Create n x n matrix for all n x n transition counts
export const createEmptyBigramMatrix = (n = ALPHA_SIZE): BigramMatrixRow[] => {
    const matrix: { countRow: number[]; rowTotal: number }[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countRow: new Array<number>(n).fill(1), rowTotal: n }
    }
    return matrix
}

// Process character bigrams in text, store counts of each bigram in bigramMatrix
export const trainBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string): void => {
    const cleanText = cleanTrainingText(text)
    for (let i = 0; i < cleanText.length - 1; i++) {
        const c1 = cleanText.charCodeAt(i)
        const c2 = cleanText.charCodeAt(i + 1)
        // TO-DO: Replace isAlphaOrSpace with check against custom set of valid letters
        if (isAlphaOrSpace(c1) && isAlphaOrSpace(c2)) {
            const u = charCodeToIndex(c1)
            const v = charCodeToIndex(c2)
            bigramMatrix[u].countRow[v]++
            bigramMatrix[u].rowTotal++
        }
    }
}

// Process character bigrams in text, run bigrams through bigramMatrix and calculate average probability to normalize by length
export const runTextThroughBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string): number => {
    const cleanText = cleanTextToScore(text)
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < cleanText.length - 1; i++) {
        const c1 = cleanText.charCodeAt(i)
        const c2 = cleanText.charCodeAt(i + 1)
        if (isAlphaOrSpace(c1) && isAlphaOrSpace(c2)) {
            const u = charCodeToIndex(c1)
            const v = charCodeToIndex(c2)
            numerator += Math.log(bigramMatrix[u].countRow[v] / bigramMatrix[u].rowTotal)
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

// Calculate expected cutoff scores (three levels of strictness)
export const getCutoffScores = (bigramMatrix: BigramMatrixRow[], goodText: string[], badText: string[]): BigramMatrixCutoffs => {
    const goodScores = goodText.map((good) => runTextThroughBigramMatrix(bigramMatrix, good))
    const badScores = badText.map((bad) => runTextThroughBigramMatrix(bigramMatrix, bad))
    let minGoodScore = Number.POSITIVE_INFINITY
    for (const goodScore of goodScores) minGoodScore = Math.min(minGoodScore, goodScore)
    let maxBadScore = 0
    for (const badScore of badScores) maxBadScore = Math.max(maxBadScore, badScore)
    return { low: Math.min(minGoodScore, maxBadScore), med: (minGoodScore + maxBadScore) / 2, hi: Math.max(minGoodScore, maxBadScore) }
}

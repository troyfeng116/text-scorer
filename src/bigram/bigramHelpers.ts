import { ALPHA_SIZE } from '../utils/constants'
import { charCodeToIndex, isAlphaOrSpace } from '../utils/helpers'
import { BigramMatrixRow } from './BigramMatrix'

export const createEmptyBigramMatrix = (n = ALPHA_SIZE): BigramMatrixRow[] => {
    const matrix: { countRow: number[]; rowTotal: number }[] = new Array(n)
    for (let i = 0; i < n; i++) {
        // Laplace smooth
        matrix[i] = { countRow: new Array<number>(n).fill(1), rowTotal: n }
    }
    return matrix
}

export const trainBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string): void => {
    for (let i = 0; i < text.length - 1; i++) {
        const c1 = text.charCodeAt(i)
        const c2 = text.charCodeAt(i + 1)
        // TO-DO: Replace isAlphaOrSpace with check against custom set of valid letters
        if (isAlphaOrSpace(c1) && isAlphaOrSpace(c2)) {
            const u = charCodeToIndex(c1)
            const v = charCodeToIndex(c2)
            bigramMatrix[u].countRow[v]++
            bigramMatrix[u].rowTotal++
        }
    }
}

export const runWordThroughBigramMatrix = (bigramMatrix: BigramMatrixRow[], text: string): number => {
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < text.length - 1; i++) {
        const c1 = text.charCodeAt(i)
        const c2 = text.charCodeAt(i + 1)
        if (isAlphaOrSpace(c1) && isAlphaOrSpace(c2)) {
            const u = charCodeToIndex(c1)
            const v = charCodeToIndex(c2)
            numerator += Math.log(bigramMatrix[u].countRow[v] / bigramMatrix[u].rowTotal)
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

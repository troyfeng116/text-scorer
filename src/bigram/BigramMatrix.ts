import { ALPHA_SIZE } from '../utils/constants'
import { createEmptyBigramMatrix, runWordThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { frankensteinTrainingText } from '../data/nlp-frankenstein'

export interface BigramMatrixRow {
    countRow: number[]
    rowTotal: number
}

interface BigramMatrixInterface {
    bigramMatrix: BigramMatrixRow[]
    alphaSize: number
    trainedTextCache: { [text: string]: boolean }

    train: (text: string) => void
    getScore: (text: string) => number
}

export class BigramMatrix implements BigramMatrixInterface {
    alphaSize: number
    bigramMatrix: BigramMatrixRow[]
    trainedTextCache: { [text: string]: boolean }

    constructor(n = ALPHA_SIZE, initialTrainingText = frankensteinTrainingText) {
        this.alphaSize = n
        this.bigramMatrix = createEmptyBigramMatrix(n)
        trainBigramMatrix(this.bigramMatrix, initialTrainingText)
        this.trainedTextCache = {}
        this.trainedTextCache[initialTrainingText] = true
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, trainingText)
    }

    getScore = (textToScore: string): number => {
        return runWordThroughBigramMatrix(this.bigramMatrix, textToScore)
    }
}

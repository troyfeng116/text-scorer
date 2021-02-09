import { ALPHA_SIZE } from '../utils/constants'
import { createEmptyBigramMatrix, runWordThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { frankensteinTrainingText } from '../data/nlp-frankenstein'
import { cleanTrainingText, cleanTextToScore } from '../utils/helpers'

export interface BigramMatrixRow {
    countRow: number[]
    rowTotal: number
}

interface BigramMatrixInterface {
    bigramMatrix: BigramMatrixRow[]
    alphaSize: number

    train: (text: string) => void
    getScore: (text: string) => number
}

export class BigramMatrix implements BigramMatrixInterface {
    alphaSize: number
    bigramMatrix: BigramMatrixRow[]

    constructor(n = ALPHA_SIZE, initialTrainingText = frankensteinTrainingText) {
        this.alphaSize = n
        this.bigramMatrix = createEmptyBigramMatrix(n)
        trainBigramMatrix(this.bigramMatrix, cleanTrainingText(initialTrainingText))
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, cleanTrainingText(trainingText))
    }

    getScore = (textToScore: string): number => {
        return runWordThroughBigramMatrix(this.bigramMatrix, cleanTextToScore(textToScore))
    }
}

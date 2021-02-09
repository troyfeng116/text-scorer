import { ALPHA_SIZE } from '../utils/constants'
import { createEmptyBigramMatrix, getCutoffScores, runTextThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { frankensteinTrainingText } from '../data/nlp-frankenstein'
import { defaultBadSamples, defaultGoodSamples } from '../data/goodAndBadText'

export interface BigramMatrixRow {
    countRow: number[]
    rowTotal: number
}

export interface BigramMatrixCutoffs {
    low: number
    med: number
    hi: number
}

export enum BigramMatrixCutoffStrictness {
    Strict = 'Strict',
    Avg = 'Avg',
    Loose = 'Lose',
}

interface BigramMatrixInterface {
    bigramMatrix: BigramMatrixRow[]
    alphaSize: number
    cutoffScores: BigramMatrixCutoffs

    train: (text: string) => void
    getScore: (text: string) => number
    recalibrateCutoffScores: (goodSamples?: string[], badSamples?: string[]) => void
    isGibberish: (text: string, strictness?: BigramMatrixCutoffStrictness) => boolean
}

export class BigramMatrix implements BigramMatrixInterface {
    alphaSize: number
    bigramMatrix: BigramMatrixRow[]
    cutoffScores: BigramMatrixCutoffs

    constructor(n = ALPHA_SIZE, initialTrainingText = frankensteinTrainingText, goodSamples = defaultGoodSamples, badSamples = defaultBadSamples) {
        this.alphaSize = n
        this.bigramMatrix = createEmptyBigramMatrix(n)
        this.train(initialTrainingText)
        this.cutoffScores = getCutoffScores(this.bigramMatrix, goodSamples, badSamples)
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, trainingText)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughBigramMatrix(this.bigramMatrix, textToScore)
    }

    recalibrateCutoffScores = (goodSamples = defaultGoodSamples, badSamples = defaultBadSamples): void => {
        this.cutoffScores = getCutoffScores(this.bigramMatrix, goodSamples, badSamples)
    }

    isGibberish = (text: string, strictness = BigramMatrixCutoffStrictness.Avg): boolean => {
        const { low, med, hi } = this.cutoffScores
        const cutoff = strictness === BigramMatrixCutoffStrictness.Strict ? hi : strictness === BigramMatrixCutoffStrictness.Avg ? med : low
        return this.getScore(text) < cutoff
    }
}

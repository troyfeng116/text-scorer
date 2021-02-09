import { defaultBadSamples, defaultGoodSamples, DEFAULT_CHARS_TO_INCLUDE } from '../utils/constants'
import { createEmptyBigramMatrix, getCharCodeMap, getCutoffScores, runTextThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { frankensteinTrainingText } from '../data/nlp-frankenstein'

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
    Loose = 'Loose',
}

interface BigramMatrixConstructorOptions {
    initialTrainingText?: string
    goodSamples?: string[]
    badSamples?: string[]
    additionalCharsToInclude?: string
}

interface BigramMatrixInterface {
    bigramMatrix: BigramMatrixRow[]
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
    charCodeMap: { [key: number]: number }

    constructor(options: BigramMatrixConstructorOptions = {}) {
        const { initialTrainingText = frankensteinTrainingText, goodSamples = defaultGoodSamples, badSamples = defaultBadSamples, additionalCharsToInclude = '' } = options
        const { charCodeMap, uniqueChars } = getCharCodeMap(DEFAULT_CHARS_TO_INCLUDE + additionalCharsToInclude)
        this.charCodeMap = charCodeMap
        this.alphaSize = uniqueChars
        this.bigramMatrix = createEmptyBigramMatrix(uniqueChars)
        this.train(initialTrainingText)
        this.cutoffScores = getCutoffScores(this.bigramMatrix, goodSamples, badSamples, charCodeMap)
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, trainingText, this.charCodeMap)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughBigramMatrix(this.bigramMatrix, textToScore, this.charCodeMap)
    }

    recalibrateCutoffScores = (goodSamples = defaultGoodSamples, badSamples = defaultBadSamples): void => {
        this.cutoffScores = getCutoffScores(this.bigramMatrix, goodSamples, badSamples, this.charCodeMap)
    }

    isGibberish = (text: string, strictness = BigramMatrixCutoffStrictness.Avg): boolean => {
        const { low, med, hi } = this.cutoffScores
        const cutoff = strictness === BigramMatrixCutoffStrictness.Strict ? low : strictness === BigramMatrixCutoffStrictness.Avg ? med : hi
        return this.getScore(text) < cutoff
    }
}

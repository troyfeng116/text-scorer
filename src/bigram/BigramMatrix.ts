import { defaultBadSamples, defaultGoodSamples, DEFAULT_CHARS_TO_INCLUDE } from '../utils/constants'
import { getCharCodeMap } from '../utils/helpers'
import { createEmptyBigramMatrix, getBigramCutoffScores, runTextThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { frankensteinTrainingText } from '../data/nlp-frankenstein'
import { CutoffScore, CutoffScoreStrictness, NGramMatrix, NGramMatrixOptions } from '..'

export interface BigramMatrixRow {
    countRow: number[]
    rowTotal: number
}

interface BigramMatrixInterface extends NGramMatrix {
    bigramMatrix: BigramMatrixRow[]
}

export class BigramMatrix implements BigramMatrixInterface {
    alphaSize: number
    bigramMatrix: BigramMatrixRow[]
    cutoffScores: CutoffScore
    charCodeMap: { [key: number]: number }

    constructor(options: NGramMatrixOptions = {}) {
        const { initialTrainingText = frankensteinTrainingText, goodSamples = defaultGoodSamples, badSamples = defaultBadSamples, additionalCharsToInclude = '' } = options
        const { charCodeMap, uniqueChars } = getCharCodeMap(DEFAULT_CHARS_TO_INCLUDE + additionalCharsToInclude)
        this.charCodeMap = charCodeMap
        this.alphaSize = uniqueChars
        this.bigramMatrix = createEmptyBigramMatrix(uniqueChars)
        this.train(initialTrainingText)
        this.cutoffScores = getBigramCutoffScores(this.bigramMatrix, goodSamples, badSamples, charCodeMap)
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, trainingText, this.charCodeMap)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughBigramMatrix(this.bigramMatrix, textToScore, this.charCodeMap)
    }

    recalibrateCutoffScores = (goodSamples = defaultGoodSamples, badSamples = defaultBadSamples): void => {
        this.cutoffScores = getBigramCutoffScores(this.bigramMatrix, goodSamples, badSamples, this.charCodeMap)
    }

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => {
        const { low, med, hi } = this.cutoffScores
        const cutoff = strictness === CutoffScoreStrictness.Strict ? low : strictness === CutoffScoreStrictness.Avg ? med : hi
        return this.getScore(text) < cutoff
    }
}

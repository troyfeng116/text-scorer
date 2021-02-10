import { defaultBadSamples, defaultGoodSamples, DEFAULT_CHARS_TO_INCLUDE } from '../utils/constants'
import { CutoffScore, CutoffScoreStrictness, NGramMatrix, NGramMatrixOptions } from '..'
import { getCharCodeMap } from '../utils/helpers'
import { createEmptyTrigramMatrix, getTrigramCutoffScores, runTextThroughTrigramMatrix, trainTrigramMatrix } from './trigramHelpers'
import { harryPotterTrainingText } from '../data/harry-potter-1'

export interface TrigramMatrixLayer {
    countLayer: number[][]
    layerTotal: number
}

interface TrigramMatrixInterface extends NGramMatrix {
    trigramMatrix: TrigramMatrixLayer[]
}

export class TrigramMatrix implements TrigramMatrixInterface {
    alphaSize: number
    trigramMatrix: TrigramMatrixLayer[]
    cutoffScores: CutoffScore
    charCodeMap: { [key: number]: number }

    constructor(options: NGramMatrixOptions = {}) {
        const { initialTrainingText = harryPotterTrainingText, goodSamples = defaultGoodSamples, badSamples = defaultBadSamples, additionalCharsToInclude = '' } = options
        const { charCodeMap, uniqueChars } = getCharCodeMap(DEFAULT_CHARS_TO_INCLUDE + additionalCharsToInclude)
        this.charCodeMap = charCodeMap
        this.alphaSize = uniqueChars
        this.trigramMatrix = createEmptyTrigramMatrix(uniqueChars)
        this.train(initialTrainingText)
        this.cutoffScores = getTrigramCutoffScores(this.trigramMatrix, goodSamples, badSamples, charCodeMap)
    }

    train = (trainingText: string): void => {
        trainTrigramMatrix(this.trigramMatrix, trainingText, this.charCodeMap)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughTrigramMatrix(this.trigramMatrix, textToScore, this.charCodeMap)
    }

    recalibrateCutoffScores = (goodSamples = defaultGoodSamples, badSamples = defaultBadSamples): void => {
        this.cutoffScores = getTrigramCutoffScores(this.trigramMatrix, goodSamples, badSamples, this.charCodeMap)
    }

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => {
        const { loose, avg, strict } = this.cutoffScores
        const cutoff = strictness === CutoffScoreStrictness.Strict ? strict : strictness === CutoffScoreStrictness.Avg ? avg : loose
        return this.getScore(text) < cutoff
    }
}

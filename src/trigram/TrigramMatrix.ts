import { DEFAULT_BAD_SAMPLES, DEFAULT_GOOD_SAMPLES, DEFAULT_CHARS_TO_INCLUDE, UPPERCASE_CHARS } from '../utils/constants'
import { CutoffScore, CutoffScoreStrictness, NGramMatrix, NGramMatrixOptions } from '..'
import { getCharCodeMap } from '../utils/helpers'
import { createEmptyTrigramMatrix, getTrigramCutoffScores, runTextThroughTrigramMatrix, trainTrigramMatrix } from './trigramHelpers'
import { HARRY_POTTER_TRAINING_TEXT } from '../data/harry-potter-1'
import { DEFAULT_ALPHA_SIZE, DEFAULT_CHAR_CODE_MAP, DEFAULT_TRIGRAM_MATRIX } from '../utils/constants'

export interface TrigramMatrixLayer {
    countLayer: number[][]
    layerTotal: number
}

interface TrigramMatrixInterface extends NGramMatrix {
    trigramMatrix: TrigramMatrixLayer[]
}

export class TrigramMatrix implements TrigramMatrixInterface {
    alphaSize: number
    charsToInclude: string
    trigramMatrix: TrigramMatrixLayer[]
    cutoffScores: CutoffScore
    charCodeMap: { [key: number]: number }
    savedGoodSamples: string[]
    savedBadSamples: string[]
    ignoreCase: boolean

    constructor(options?: NGramMatrixOptions) {
        if (!options) {
            const { trigramMatrix, cutoffScores } = DEFAULT_TRIGRAM_MATRIX
            this.alphaSize = DEFAULT_ALPHA_SIZE
            this.trigramMatrix = trigramMatrix
            this.cutoffScores = cutoffScores
            this.charCodeMap = DEFAULT_CHAR_CODE_MAP
            this.savedGoodSamples = DEFAULT_GOOD_SAMPLES
            this.savedBadSamples = DEFAULT_BAD_SAMPLES
            this.ignoreCase = true
            this.charsToInclude = DEFAULT_CHARS_TO_INCLUDE
            return
        }
        const { initialTrainingText = HARRY_POTTER_TRAINING_TEXT, goodSamples = DEFAULT_GOOD_SAMPLES, badSamples = DEFAULT_BAD_SAMPLES, ignoreCase = true, additionalCharsToInclude = '' } = options
        const { charCodeMap, uniqueChars, noDuplicateCharsStr } = getCharCodeMap(DEFAULT_CHARS_TO_INCLUDE + additionalCharsToInclude + (!ignoreCase ? UPPERCASE_CHARS : ''))
        this.charCodeMap = charCodeMap
        this.alphaSize = uniqueChars
        this.charsToInclude = noDuplicateCharsStr
        this.trigramMatrix = createEmptyTrigramMatrix(uniqueChars)
        this.train(initialTrainingText)
        this.cutoffScores = getTrigramCutoffScores(this.trigramMatrix, goodSamples, badSamples, charCodeMap, ignoreCase)
        this.savedGoodSamples = goodSamples
        this.savedBadSamples = badSamples
        this.ignoreCase = ignoreCase
    }

    train = (trainingText: string): void => {
        trainTrigramMatrix(this.trigramMatrix, trainingText, this.charCodeMap, this.charsToInclude, this.ignoreCase)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughTrigramMatrix(this.trigramMatrix, textToScore, this.charCodeMap, this.ignoreCase)
    }

    recalibrateCutoffScores = (goodSamples = DEFAULT_GOOD_SAMPLES, badSamples = DEFAULT_BAD_SAMPLES): void => {
        this.cutoffScores = getTrigramCutoffScores(this.trigramMatrix, goodSamples, badSamples, this.charCodeMap, this.ignoreCase)
    }

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => {
        const { loose, avg, strict } = this.cutoffScores
        const cutoff = strictness === CutoffScoreStrictness.Strict ? strict : strictness === CutoffScoreStrictness.Avg ? avg : loose
        return this.getScore(text) < cutoff
    }
}

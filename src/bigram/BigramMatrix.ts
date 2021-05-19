import { DEFAULT_BAD_SAMPLES, DEFAULT_GOOD_SAMPLES, DEFAULT_CHARS_TO_INCLUDE, UPPERCASE_CHARS } from '../utils/constants'
import { cleanAndExtractWordsFromTextToScore, getCharCodeMap, getDefaultBigramMatrixFromJSON } from '../utils/helpers'
import { createEmptyBigramMatrix, getBigramCutoffScores, runTextThroughBigramMatrix, trainBigramMatrix } from './bigramHelpers'
import { CutoffScore, CutoffScoreStrictness, NGramMatrix, NGramMatrixOptions } from '..'
import { HARRY_POTTER_TRAINING_TEXT } from '../data/harry-potter-1'
import { DEFAULT_ALPHA_SIZE, DEFAULT_CHAR_CODE_MAP } from '../utils/constants'

export interface BigramMatrixRow {
    countRow: number[]
    rowTotal: number
}

interface BigramMatrixInterface extends NGramMatrix {
    bigramMatrix: BigramMatrixRow[]
}

export class BigramMatrix implements BigramMatrixInterface {
    alphaSize: number
    charsToInclude: string
    bigramMatrix: BigramMatrixRow[]
    cutoffScores: CutoffScore
    charCodeMap: { [key: number]: number }
    savedGoodSamples: string[]
    savedBadSamples: string[]
    ignoreCase: boolean

    constructor(options?: NGramMatrixOptions) {
        if (!options) {
            const { bigramMatrix, cutoffScores } = getDefaultBigramMatrixFromJSON()
            this.alphaSize = DEFAULT_ALPHA_SIZE
            this.bigramMatrix = bigramMatrix
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
        this.bigramMatrix = createEmptyBigramMatrix(uniqueChars)
        this.train(initialTrainingText)
        this.cutoffScores = getBigramCutoffScores(this.bigramMatrix, goodSamples, badSamples, charCodeMap, ignoreCase)
        this.savedGoodSamples = goodSamples
        this.savedBadSamples = badSamples
        this.ignoreCase = ignoreCase
    }

    train = (trainingText: string): void => {
        trainBigramMatrix(this.bigramMatrix, trainingText, this.charCodeMap, this.charsToInclude, this.ignoreCase)
        this.recalibrateCutoffScores(this.savedGoodSamples, this.savedBadSamples)
    }

    getScore = (textToScore: string): number => {
        return runTextThroughBigramMatrix(this.bigramMatrix, textToScore, this.charCodeMap, this.ignoreCase)
    }

    recalibrateCutoffScores = (goodSamples = DEFAULT_GOOD_SAMPLES, badSamples = DEFAULT_BAD_SAMPLES): void => {
        this.cutoffScores = getBigramCutoffScores(this.bigramMatrix, goodSamples, badSamples, this.charCodeMap, this.ignoreCase)
    }

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => {
        const { loose, avg, strict } = this.cutoffScores
        const cutoff = strictness === CutoffScoreStrictness.Strict ? strict : strictness === CutoffScoreStrictness.Avg ? avg : loose
        return this.getScore(text) < cutoff
    }

    getWordByWordAnalysis = (
        text: string,
        strictness?: CutoffScoreStrictness,
    ): {
        numWords: number
        words: string[]
        numGibberishWords: number
        gibberishWords: string[]
        textScores: number[]
        cutoffs: CutoffScore
    } => {
        const words = cleanAndExtractWordsFromTextToScore(text, this.ignoreCase)
        const gibberishWords: string[] = []
        const textScores: number[] = []
        for (const word of words) {
            if (this.isGibberish(word, strictness)) gibberishWords.push(word)
            textScores.push(this.getScore(word))
        }
        return { numWords: words.length, words: words, numGibberishWords: gibberishWords.length, gibberishWords: gibberishWords, textScores: textScores, cutoffs: this.cutoffScores }
    }
}

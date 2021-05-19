import { BigramMatrix } from './bigram'
import { TrigramMatrix } from './trigram'

// TO DO: Filter outliers from bad/good text score vectors
export interface CutoffScore {
    strict: number
    avg: number
    loose: number
}

export enum CutoffScoreStrictness {
    Strict = 'Strict',
    Avg = 'Avg',
    Loose = 'Loose',
}

export interface NGramMatrix {
    cutoffScores: CutoffScore
    train: (text: string) => void
    getScore: (text: string) => number
    recalibrateCutoffScores: (goodSamples?: string[], badSamples?: string[]) => void
    isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean
    getWordByWordAnalysis: (
        text: string,
        strictness?: CutoffScoreStrictness,
    ) => {
        numWords: number
        words: string[]
        numGibberishWords: number
        gibberishWords: string[]
        textScores: number[]
        cutoffs: CutoffScore
    }
}

export interface NGramMatrixOptions {
    initialTrainingText?: string
    goodSamples?: string[]
    badSamples?: string[]
    ignoreCase?: boolean
    additionalCharsToInclude?: string
}

interface TextScorerInterface {
    NGramMatrix: NGramMatrix
    trainWithEnglishText: (text: string) => void
    recalibrateCutoffScores: (goodSamples: string[], badSamples: string[]) => void
    isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean
    getTextScore: (text: string) => number
    getCutoffScores: () => CutoffScore
    getTextScoreAndCutoffs: (text: string) => { cutoffs: CutoffScore; score: number }
    getDetailedWordInfo: (
        text: string,
        strictness?: CutoffScoreStrictness,
    ) => {
        numWords: number
        words: string[]
        numGibberishWords: number
        gibberishWords: string[]
        textScores: number[]
        cutoffs: CutoffScore
    }
}

export class TextScorer implements TextScorerInterface {
    NGramMatrix: NGramMatrix

    constructor(useBigram = true, options?: NGramMatrixOptions) {
        this.NGramMatrix = useBigram ? new BigramMatrix(options) : new TrigramMatrix(options)
    }

    trainWithEnglishText = (text: string): void => this.NGramMatrix.train(text)

    recalibrateCutoffScores = (goodSamples: string[], badSamples: string[]): void => this.NGramMatrix.recalibrateCutoffScores(goodSamples, badSamples)

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => this.NGramMatrix.isGibberish(text, strictness)

    getTextScore = (text: string): number => this.NGramMatrix.getScore(text)

    getCutoffScores = (): CutoffScore => this.NGramMatrix.cutoffScores

    getTextScoreAndCutoffs = (text: string): { cutoffs: CutoffScore; score: number } => {
        const { cutoffScores } = this.NGramMatrix
        const matrixScore = this.NGramMatrix.getScore(text)
        return { cutoffs: cutoffScores, score: matrixScore }
    }

    getDetailedWordInfo = (
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
        return this.NGramMatrix.getWordByWordAnalysis(text, strictness)
    }
}

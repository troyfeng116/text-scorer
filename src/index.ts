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
}

export interface NGramMatrixOptions {
    initialTrainingText?: string
    goodSamples?: string[]
    badSamples?: string[]
    additionalCharsToInclude?: string
}

interface GibberishScorerInterface {
    NGramMatrix: NGramMatrix
    train: (text: string) => void
    recalibrateCutoffs: (goodSamples: string[], badSamples: string[]) => void
    isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean
    getScoreInfo: (text: string) => { cutoffs: CutoffScore; score: number }
}

export class GibberishScorer implements GibberishScorerInterface {
    NGramMatrix: NGramMatrix

    constructor(useBigram = true, options?: NGramMatrixOptions) {
        this.NGramMatrix = useBigram ? new BigramMatrix(options) : new TrigramMatrix(options)
    }

    train = (text: string): void => this.NGramMatrix.train(text)

    recalibrateCutoffs = (goodSamples: string[], badSamples: string[]): void => this.NGramMatrix.recalibrateCutoffScores(goodSamples, badSamples)

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg): boolean => this.NGramMatrix.isGibberish(text, strictness)

    getScoreInfo = (text: string): { cutoffs: CutoffScore; score: number } => {
        const { cutoffScores } = this.NGramMatrix
        const matrixScore = this.NGramMatrix.getScore(text)
        return { cutoffs: cutoffScores, score: matrixScore }
    }
}

import { BigramMatrix } from './bigram'
import { TrigramMatrix } from './trigram'

// TO DO: Filter outliers from bad/good text score vectors
export interface CutoffScore {
    low: number
    med: number
    hi: number
}

export enum CutoffScoreStrictness {
    Strict = 'Strict',
    Avg = 'Avg',
    Loose = 'Loose',
}

interface GibberishScorerInterface {
    bigramMatrix: BigramMatrix
    trigramMatrix: TrigramMatrix

    trainBigramMatrix: (text: string) => void
    recalibrateBigramCutoff: (goodText: string[], badText: string[]) => void

    trainTrigramMatrix: (text: string) => void
    recalibrateTrigramCutoff: (goodText: string[], badText: string[]) => void

    isGibberish: (text: string, strictness?: CutoffScoreStrictness, useBigram?: boolean) => boolean
}

export class GibberishScorer implements GibberishScorerInterface {
    bigramMatrix: BigramMatrix
    trigramMatrix: TrigramMatrix

    constructor() {
        this.bigramMatrix = new BigramMatrix()
        this.trigramMatrix = new TrigramMatrix()
    }

    trainBigramMatrix = (text: string): void => this.bigramMatrix.train(text)
    recalibrateBigramCutoff = (goodText: string[], badText: string[]): void => this.bigramMatrix.recalibrateCutoffScores(goodText, badText)

    trainTrigramMatrix = (text: string): void => this.trigramMatrix.train(text)
    recalibrateTrigramCutoff = (goodText: string[], badText: string[]): void => this.trigramMatrix.recalibrateCutoffScores(goodText, badText)

    isGibberish = (text: string, strictness = CutoffScoreStrictness.Avg, useBigram = true): boolean => {
        return useBigram ? this.bigramMatrix.isGibberish(text, strictness) : this.trigramMatrix.isGibberish(text, strictness)
    }
}

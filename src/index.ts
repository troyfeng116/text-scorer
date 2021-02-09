import { BigramMatrix } from './bigram'

interface GibberishScorerInterface {
    bigramMatrix: BigramMatrix
    trainBigramMatrix: (text: string) => void
    getBigramScore: (text: string) => number
}

export class GibberishScorer implements GibberishScorerInterface {
    bigramMatrix: BigramMatrix

    constructor() {
        this.bigramMatrix = new BigramMatrix()
    }

    trainBigramMatrix = (text: string): void => this.bigramMatrix.train(text)
    getBigramScore = (text: string): number => this.bigramMatrix.getScore(text)
}

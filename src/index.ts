import { getBigramMatrix, getTrigramMatrix } from './nlp-functions'

interface GibberishScorerInterface {
    bigramLogMatrix: number[][]
    trigramLogMatrix: number[][][]
    retrainBigramMatrix: (text: string) => void
}

export class GibberishScorer implements GibberishScorerInterface {
    bigramLogMatrix: number[][]
    trigramLogMatrix: number[][][]
    constructor() {
        this.bigramLogMatrix = getBigramMatrix()
        this.trigramLogMatrix = getTrigramMatrix()
    }
    retrainBigramMatrix = (text: string): void => {
        this.bigramLogMatrix = []
    }
}

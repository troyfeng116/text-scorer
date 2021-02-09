import { frankensteinTrainingText } from './nlp-frankenstein'
import { ozTrainingText } from './nlp-oz'
import { slangTrainingText } from './nlp-slang'

const ALPHA_SIZE = 27

export const getAvgTrigramTransitionProbability = (word: string, probMatrix: number[][][]): number => {
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < word.length - 2; i++) {
        if (isAlphaOrSpace(word.charCodeAt(i)) && isAlphaOrSpace(word.charCodeAt(i + 1)) && isAlphaOrSpace(word.charCodeAt(i + 2))) {
            numerator += probMatrix[charCodeToIndex(word.charCodeAt(i))][charCodeToIndex(word.charCodeAt(i + 1))][charCodeToIndex(word.charCodeAt(i + 2))]
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

// Run word through bi-gram probability matrix, undo natural log conversion for final average
export const getAvgTransitionProbability = (word: string, probMatrix: number[][]): number => {
    let numerator = 0,
        denominator = 0
    for (let i = 0; i < word.length - 1; i++) {
        if (isAlphaOrSpace(word.charCodeAt(i)) && isAlphaOrSpace(word.charCodeAt(i + 1))) {
            numerator += probMatrix[charCodeToIndex(word.charCodeAt(i))][charCodeToIndex(word.charCodeAt(i + 1))]
            denominator++
        }
    }
    return Math.exp(numerator / (denominator === 0 ? 1 : denominator))
}

export const getTrigramMatrix = (): number[][][] => {
    const freqMatrix: number[][][] = new Array(ALPHA_SIZE)
    for (let i = 0; i < ALPHA_SIZE; i++) {
        freqMatrix[i] = new Array(ALPHA_SIZE)
        for (let j = 0; j < ALPHA_SIZE; j++) {
            freqMatrix[i][j] = new Array(ALPHA_SIZE).fill(0)
        }
    }
    trainTrigramMatrix(freqMatrix, cleanTrainingText(frankensteinTrainingText))
    trainTrigramMatrix(freqMatrix, cleanTrainingText(ozTrainingText))
    trainTrigramMatrix(freqMatrix, cleanTrainingText(slangTrainingText))
    return convertToProbabilityTrigramMatrix(freqMatrix)
}

const trainTrigramMatrix = (matrix: number[][][], text: string) => {
    for (let i = 0; i < text.length - 2; i++) {
        if (isAlphaOrSpace(text.charCodeAt(i)) && isAlphaOrSpace(text.charCodeAt(i + 1)) && isAlphaOrSpace(text.charCodeAt(i + 2))) {
            matrix[charCodeToIndex(text.charCodeAt(i))][charCodeToIndex(text.charCodeAt(i + 1))][charCodeToIndex(text.charCodeAt(i + 2))]++
        }
    }
}

const convertToProbabilityTrigramMatrix = (freqMatrix: number[][][]): number[][][] => {
    const ans: number[][][] = []
    for (let i = 0; i < freqMatrix.length; i++) {
        let total = 0
        for (let j = 0; j < freqMatrix[i].length; j++) {
            for (let k = 0; k < freqMatrix[i][j].length; k++) total += freqMatrix[i][j][k]
        }
        //console.log(total)
        ans.push([])
        for (let j = 0; j < freqMatrix[i].length; j++) {
            ans[i].push([])
            for (let k = 0; k < freqMatrix[i][j].length; k++) ans[i][j].push(Math.log((freqMatrix[i][j][k] + 1) / (total + ALPHA_SIZE)))
        }
    }
    return ans
}

// Create 27 x 27 matrix, populate with training texts
export const getBigramMatrix = (): number[][] => {
    const freqMatrix: number[][] = new Array(ALPHA_SIZE)
    for (let i = 0; i < ALPHA_SIZE; i++) freqMatrix[i] = new Array(ALPHA_SIZE).fill(0)
    trainBigramMatrix(freqMatrix, cleanTrainingText(frankensteinTrainingText))
    trainBigramMatrix(freqMatrix, cleanTrainingText(ozTrainingText))
    trainBigramMatrix(freqMatrix, cleanTrainingText(slangTrainingText))
    return convertToProbabilityBigramMatrix(freqMatrix)
}

// Read text, transfer bi-gram char counts to matrix
const trainBigramMatrix = (matrix: number[][], text: string) => {
    for (let i = 0; i < text.length - 1; i++) {
        if (isAlphaOrSpace(text.charCodeAt(i)) && isAlphaOrSpace(text.charCodeAt(i + 1))) {
            matrix[charCodeToIndex(text.charCodeAt(i))][charCodeToIndex(text.charCodeAt(i + 1))]++
        }
    }
}

// Convert bi-gram char count matrix to probabilities. Laplace smooth + natural log to prevent underflow
const convertToProbabilityBigramMatrix = (freqMatrix: number[][]): number[][] => {
    const ans: number[][] = []
    for (let i = 0; i < freqMatrix.length; i++) {
        let total = 0
        for (let j = 0; j < freqMatrix[i].length; j++) total += freqMatrix[i][j]
        //console.log(total)
        ans.push([])
        for (let j = 0; j < freqMatrix[i].length; j++) {
            ans[i].push(Math.log((freqMatrix[i][j] + 1) / (total + ALPHA_SIZE * ALPHA_SIZE)))
        }
    }
    return ans
}

const isAlphaOrSpace = (charCode: number): boolean => {
    return (97 <= charCode && charCode <= 122) || charCode == 32
}

const charCodeToIndex = (charCode: number): number => {
    if (charCode === 32) return 26
    return charCode - 97
}

const cleanTrainingText = (text: string): string => {
    return text.toLowerCase().replace(/\.|\?|\!|\,|\&/gi, '')
}

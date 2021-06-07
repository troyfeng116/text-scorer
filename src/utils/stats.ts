/**
 * Returns median value of list of numbers.
 * @param arr Array of numbers from which to extract median.
 * @returns Median of `arr`.
 */
export const getMedian = (arr: number[]): number => {
    const n = arr.length
    if (n === 0) return 0
    const arrCopy = [...arr]
    arrCopy.sort((a, b) => a - b)
    const m = Math.floor((n - 1) / 2)
    if (n % 2 === 1) return arrCopy[m]
    return (arrCopy[m] + arrCopy[m + 1]) / 2
}

/**
 * Retrieves median and quartile values of list of numbers.
 * @param arr Array of numbers from which to extract median and quartiles.
 * @returns Object containing `median`, `quartile1`, and `quartile2`.
 */
export const getQuartileInfo = (arr: number[]): { median: number; quartile1: number; quartile3: number } => {
    const arrCopy = [...arr]
    arrCopy.sort((a, b) => a - b)
    const n = arrCopy.length
    const m = Math.floor((n - 1) / 2)
    const quartile1 = getMedian(arrCopy.slice(0, m))
    const quartile3 = getMedian(arrCopy.slice(n % 2 === 1 ? m + 1 : m + 2))
    const median = getMedian(arrCopy)
    return { median: median, quartile1: quartile1, quartile3: quartile3 }
}

/**
 * Removes outliers from given list of numbers, if any (by 1.5 IQR metric).
 * @param arr Array of numbers from which to remove outliers.
 * @returns Shallow copy of `arr`, without outliers. Does not modify original `arr`.
 */
export const removeOutliers = (arr: number[]): number[] => {
    if (arr.length <= 3) return [...arr]
    const { quartile1, quartile3 } = getQuartileInfo(arr)
    const iqr = quartile3 - quartile1
    const ans: number[] = []
    for (const num of arr) {
        if (quartile1 - 1.5 * iqr <= num && num <= quartile3 + 1.5 * iqr) ans.push(num)
    }
    return ans
}

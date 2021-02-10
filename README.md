# gibberish-scorer (v1.0.0)

A configurable gibberish scorer.

## Installation

```bash
npm install gibberish-scorer
```

## Usage and Examples

### Import module
```ts
import { GibberishScorer } from 'gibberish-scorer'
...
```


### Constructor
```ts
const gibberishScorer = new GibberishScorer(useBigram?: boolean, options?: {
    initialTrainingText?: string
    goodSamples?: string[]
    badSamples?: string[]
    additionalCharsToInclude?: string
})
```
Instantiates new `GibberishScorer` object. Constructor takes optional arguments `useBigram` (defaults to `true`: prefer bigram over trigram) and `options`. All fields in `options` default to hard-coded default values: `initialTrainingText` defaults to stringified J.K. Rowling's Harry Potter and the Sorcerer's Stone, `goodSamples` defaults to an array of a few random English sentences, `badSamples` defaults to a few gibberish strings, and `additionalCharsToInclude` defaults to the empty string. Note that `additionalCharsToInclude` will append chars to a default of all lower case alphabetic characters and the space character (unicodes 32 and 97-122).


### English training
`GibberishScorer.train: (text: string) => void`
```js
gibberishScorer.train(my_own_training_text) // Additional training for gibberishScorer if desired
```
Trains the `GibberishScorer` with any training string passed to it. This will adjust the n-gram probabilities on top of the initial training and any prior training.


### Cutoff score prediction training
`GibberishScorer.recalibrateCutoffs: (goodSamples: string[], badSamples: string[]) => void`
```js
gibberishScorer.recalibrateCutoffs(good_sample_texts, bad_sample_texts) // Recalculate predicted score cutoffs based on provided samples
```
Re-calculates the estimated cutoff scores.


### Detect gibberish
`GibberishScorer.isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean`
```js
gibberishScorer.isGibberish('The quick fox jumps over the lazy dog') // false
gibberishScorer.isGibberish('Tom Brady') // false
gibberishScorer.isGibberish('oqbwifsiehf osdfbw sjkdoo thehwei') // true
gibberishScorer.isGibberish('This sentence is half gibberish lwpqgtyukcvi', 'Avg') // false
gibberishScorer.isGibberish('This sentence is half gibberish lwpqgtyukcvi', 'Strict') // true
```
Returns whether input text string is gibberish, according to trained cutoff predictions and desired strictness. `strictness` field must be `'Loose' | 'Avg' | 'Strict'` and defaults to `Avg`.


### Detailed scoring info
`GibberishScorer.getScoreInfo: (text: string) => { cutoffs: CutoffScore; score: number }`
```js
gibberishScorer.getScoreInfo('This sentence is half gibberish lwpqgtyukcvi')
// {
//  cutoffs: {
//      loose: 0.021219297921045675,
//      avg: 0.028564356546162385,
//      strict: 0.035909415171279095
//  },
//  score: 0.030018117586724725
// }
```
Returns current cutoffs of `NGramMatrix` and calculated score for inspection.


### Type and enum definitions
```ts
interface GibberishScorerInterface {
    NGramMatrix: NGramMatrix
    train: (text: string) => void
    recalibrateCutoffs: (goodSamples: string[], badSamples: string[]) => void
    isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean
    getScoreInfo: (text: string) => { cutoffs: CutoffScore; score: number }
}

class GibberishScorer implements GibberishScorerInterface {}

interface NGramMatrix {
    cutoffScores: CutoffScore
    train: (text: string) => void
    getScore: (text: string) => number
    recalibrateCutoffScores: (goodSamples?: string[], badSamples?: string[]) => void
    isGibberish: (text: string, strictness?: CutoffScoreStrictness) => boolean
}

interface NGramMatrixOptions {
    initialTrainingText?: string
    goodSamples?: string[]
    badSamples?: string[]
    additionalCharsToInclude?: string
}

enum CutoffScoreStrictness {
    Strict = 'Strict',
    Avg = 'Avg',
    Loose = 'Loose',
}
```


## License

[MIT](https://choosealicense.com/licenses/mit/)

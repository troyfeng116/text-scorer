module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'no-var': 'error',
        'prefer-const': 'error',
        'prettier/prettier': 'error',
        quotes: ['error', 'single', { avoidEscape: true }],
    },
}

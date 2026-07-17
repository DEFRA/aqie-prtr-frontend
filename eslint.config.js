import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['node', 'vitest'],
    ignores: [...neostandard.resolveIgnoresFromGitignore()],
    noJsx: true,
    noStyle: true
  }),
  {
    files: ['src/**/*.js'],
    ignores: ['**/*.test.js'],
    rules: {
      curly: ['error', 'all'],
      complexity: ['error', 10],
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          enforceConst: true
        }
      ]
    }
  }
]

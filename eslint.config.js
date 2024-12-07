import antfu from '@antfu/eslint-config'

export default antfu(
  { type: 'lib', ignores: ['**/fixtures', 'packages/matchers/src/matchers/generated.ts'], typescript: { tsconfigPath: 'tsconfig.json' } },
)

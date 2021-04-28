const sharedRules = {
  'prettier/prettier': ['error'],
};

module.exports = {
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 11 },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    ...sharedRules,
  },

  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['prettier', '@typescript-eslint'],
      extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
      env: {
        node: true,
        es6: true,
      },
      rules: {
        ...sharedRules,
      },
    },
  ],
};

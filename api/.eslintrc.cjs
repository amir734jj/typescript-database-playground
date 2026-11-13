module.exports = {
    root: true,
    env: { es2022: true, node: true },
    extends: ['airbnb-base'],
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    ignorePatterns: ['dist/', 'node_modules/'],
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'linebreak-style': 'off',
        'import/prefer-default-export': 'off',
        'object-curly-newline': ['error', { consistent: true }],
        'no-void': ['error', { allowAsStatement: true }],
    },
    overrides: [
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            extends: ['plugin:@typescript-eslint/recommended'],
            settings: {
                'import/resolver': {
                    typescript: { project: './tsconfig.json' },
                    node: true,
                },
            },
            rules: {
                indent: 'off',
                'import/extensions': 'off',
                'class-methods-use-this': 'off',
                'no-empty-function': ['error', { allow: ['constructors'] }],
                'no-useless-constructor': 'off',
                '@typescript-eslint/no-useless-constructor': 'error',
                'no-use-before-define': 'off',
                '@typescript-eslint/no-use-before-define': ['error', { classes: false, typedefs: false }],
            },
        },
        {
            files: ['*.cjs', '*.mjs'],
            rules: {
                'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            },
        },
        {
            files: ['tests/*.test.mjs'],
            rules: {
                'import/extensions': ['error', 'always', { ignorePackages: true }],
            },
        },
        {
            files: ['src/dtos/requests.dto.ts', 'src/dtos/responses.dto.ts', 'src/guards/authentication.ts'],
            rules: {
                'max-classes-per-file': 'off',
            },
        },
    ],
};

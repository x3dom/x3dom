import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        ignores: ["src/util/glTF/draco-1.5.5.js"],
    },
    {
        languageOptions: {
            ecmaVersion: 6,
            sourceType: "script",
        },

        plugins : {
            "@stylistic": stylistic,
        },

        rules: {
            "prefer-const": "error",
            "@stylistic/no-tabs": ["error"],
            "@stylistic/indent": ["error", 4, {SwitchCase: 1}],
            "@stylistic/array-bracket-spacing": ["error", "always"],
            "@stylistic/comma-dangle": ["error", "never"],
            "@stylistic/comma-spacing": ["error", { before: false, after: true }],
            "@stylistic/space-in-parens": ["error", "always", {exceptions: []}],
            "@stylistic/computed-property-spacing": ["error", "always"],
            "@stylistic/brace-style": ["error", "allman", {allowSingleLine: true}],
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/padded-blocks": ["error", "never"],
            "@stylistic/space-before-function-paren": "error",
            "@stylistic/keyword-spacing": "error",
            "@stylistic/space-infix-ops": "error", semi: "error", curly: "error", quotes: ["error", "double", { allowTemplateLiterals: true }],
            "@stylistic/one-var-declaration-per-line": ["error", "always"],
            "@stylistic/no-multiple-empty-lines": ["error", {max: 1 }],
            "@stylistic/new-parens": "error",
            "@stylistic/lines-between-class-members": ["error", "always"],
            "@stylistic/func-call-spacing": ["error", "never"],
            "@stylistic/key-spacing": ["error", {
                multiLine: {
                    beforeColon: true,
                    afterColon: true,
                },

                align: {
                    beforeColon: true,
                    afterColon: true,
                    on: "colon",
                },
            }]
        },
    }
];

export default [
    {
        files: [
            "wwwroot/**/*.js",
            "wwwroot/*.js",
            "wwwroot/lib/*.js",
        ],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script"
        },

        rules: {
            "comma-dangle": ["error", "never"],
            "no-restricted-syntax": [
                "error",
                {
                    selector: "VariableDeclaration[kind='const']",
                    message: "Use of 'const' is not allowed."
                },
                {
                    selector: "VariableDeclaration[kind='let']",
                    message: "Use of 'let' is not allowed."
                },
                {
                    selector: "ArrowFunctionExpression",
                    message: "Arrow functions are not allowed."
                }
            ],
            "no-const-assign": "error"
        }
    }
];

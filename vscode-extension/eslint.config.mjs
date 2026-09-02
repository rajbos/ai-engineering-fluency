import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";

export default [{
    files: ["**/*.ts"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
        sonarjs,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        "@typescript-eslint/naming-convention": ["warn", {
            selector: "import",
            format: ["camelCase", "PascalCase"],
        }],

        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",

        // Webview XSS hardening: session-log data (titles, tool names, model names, file paths)
        // is untrusted — it can be shaped by a malicious repo or a prompt-injected agent — so
        // direct HTML-sink writes are banned everywhere except through the sanctioned
        // `setHtml()` wrapper in src/webview/shared/domUtils.ts, which carries an inline
        // eslint-disable documenting the trust contract callers must uphold.
        "no-restricted-syntax": ["error",
            {
                selector: "AssignmentExpression[left.property.name='innerHTML']",
                message: "Direct innerHTML assignment is banned. Untrusted session-log data flows into these webviews — build the HTML with escapeHtml()/escapeAttr() and write it via setHtml(el, html) from src/webview/shared/domUtils.ts instead.",
            },
            {
                selector: "AssignmentExpression[left.property.name='outerHTML']",
                message: "Direct outerHTML assignment is banned. Use setHtml(el, html) from src/webview/shared/domUtils.ts instead.",
            },
            {
                selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
                message: "insertAdjacentHTML() is banned. Use setHtml(el, html) from src/webview/shared/domUtils.ts instead.",
            },
            {
                selector: "CallExpression[callee.object.name='document'][callee.property.name='write']",
                message: "document.write() is banned in webview code.",
            },
        ],

        // Complexity rules — violations are warnings (informational, do not break the build)
        "complexity": ["warn", 15],
        "sonarjs/cognitive-complexity": ["warn", 15],
        "max-depth": ["warn", 5],
        "max-lines-per-function": ["warn", 80],
    },
}];
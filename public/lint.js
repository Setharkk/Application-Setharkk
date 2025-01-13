const { ESLint } = require('eslint');

async function runLint() {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['C:/Users/Setha/Desktop/Application Setharkk/app/**/*.js']);

    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);

    console.log(resultText);

    const hasErrors = results.some(result => result.errorCount > 0);
    if (hasErrors) {
        process.exit(1);
    }
}

runLint().catch(error => {
    console.error(error);
    process.exit(1);
});
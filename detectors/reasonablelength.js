const relativeDifferenceFactor = (a, b) => Math.abs((a - b) / Math.max(a, b));

module.exports = (text, program, originalText) => {
    return (1 - relativeDifferenceFactor(text.length, originalText.length)) ** (1 / 10);
};

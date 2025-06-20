const MarkdownIt = require('markdown-it');
const markdownItKatex = require('@traptitech/markdown-it-katex');

function renderMarkdownWithKatex(mdText) {
    const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: false,
    }).use(markdownItKatex);

    const lineBreaksNormalizedMdText = mdText.replace(/\r\n?/g, '\n');
    return md.render(lineBreaksNormalizedMdText);
}

module.exports = renderMarkdownWithKatex;

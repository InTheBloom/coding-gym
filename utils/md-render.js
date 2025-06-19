const MarkdownIt = require('markdown-it');
const markdownItKatex = require('@traptitech/markdown-it-katex');

function renderMarkdownWithKatex(mdText) {
    const md = new MarkdownIt({
        html: true,
        breaks: true,
        linkify: true,
    }).use(markdownItKatex);

    return md.render(mdText);
}

module.exports = renderMarkdownWithKatex;

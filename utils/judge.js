const fs = require('fs').promises;
const path = require('path');

function normalizeNewLines(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

async function judgeSubmission(answerPath, expectedPath) {
    const [userOutput, expectedOutput] = await Promise.all([
        fs.readFile(answerPath, 'utf-8'),
        fs.readFile(expectedPath, 'utf-8')
    ]);

    const userOutputByLine = normalizeNewLines(userOutput).trimEnd().split("\n");
    const expectedOutputByLine = normalizeNewLines(expectedOutput).trimEnd().split("\n");

    const maxRow = Math.max(userOutputByLine.length, expectedOutputByLine.length);

    for (let i = 0; i < maxRow; i++) {
        if (userOutputByLine.length <= i) {
            return {
                isCorrect: false,
                feedback: `${i + 1}行目以降の出力が存在しません。`
            }
        }

        const ul = userOutputByLine[i] ?? '';
        const el = expectedOutputByLine[i] ?? '';

        for (let j = 0; j < Math.max(ul.length, el.length); j++) {
            const u = ul[j];
            const e = el[j];
            if (u !== e) {
                return {
                    isCorrect: false,
                    feedback: `${i + 1}行目、${j + 1}文字目が一致しません。`
                }
            }
        }
    }

    return { isCorrect: true, feedback: 'Accepted.' };
}

module.exports = { judgeSubmission };

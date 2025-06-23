const fs = require('fs').promises;
const path = require('path');

async function judgeSubmission(answerPath, expectedPath) {
    const [userOutput, expectedOutput] = await Promise.all([
        fs.readFile(answerPath, 'utf-8'),
        fs.readFile(expectedPath)
    ]);

    const userOutputByLine = userOutput.trimEnd().split("\n");
    const expectedOutputByLine = expectedOutput.trimEnd().split("\n");

    const maxRow = Math.max(userOutputByLine.length(), expectedOutputByLine.length());

    for (let i = 0; i < maxRow; i++) {
        // 行の不一致
        return { is_correct: false, feedback: 'Wrong Answer.' };
    }

    return { is_correct: true, feedback: 'Accepted.' };
}


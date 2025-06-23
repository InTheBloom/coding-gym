const fs = require('fs');
const path = require('path');
const { db, initializeSchema } = require('../db');

function loadProblemFromDir(dirPath) {
    const metaPath = path.join(dirPath, 'meta.json');
    const descriptionPath = path.join(dirPath, 'description.md');

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    validateProblemMeta(meta);
    validateTestcase(dirPath, meta);
    const description = fs.readFileSync(descriptionPath, 'utf-8');

    // Relative = プロジェクトルートからの相対パス

    const publicTestDirRelative = path.join('public', 'dataset', `${meta.problem_number}`, 'testcase');
    const privateTestDirRelative = path.join('private_dataset', `${meta.problem_number}`, 'testcase');

    // mkdir
    fs.mkdirSync(path.join(__dirname, '..', publicTestDirRelative), { recursive: true });
    fs.mkdirSync(path.join(__dirname, '..', privateTestDirRelative), { recursive: true });

    // cp
    if (meta.testcase.input) {
        fs.cpSync(path.join(dirPath, meta.testcase.input), path.join(__dirname, '..', publicTestDirRelative, meta.testcase.input), { force: true });
    }
    if (meta.testcase.output) {
        fs.cpSync(path.join(dirPath, meta.testcase.output), path.join(__dirname, '..', privateTestDirRelative, meta.testcase.output), { force: true });
    }

    // db insert用データ
    const sample_input = meta.sample.input ? fs.readFileSync(path.join(dirPath, meta.sample.input), 'utf-8') : null;
    const sample_output = meta.sample.output ? fs.readFileSync(path.join(dirPath, meta.sample.output), 'utf-8') : null;
    const testcase_input_file = meta.testcase.input ? path.join(publicTestDirRelative, meta.testcase.input) : null;
    const testcase_output_file = meta.testcase.output ? path.join(privateTestDirRelative, meta.testcase.output) : null;

    return {
        ...meta,
        description,
        sample_input,
        sample_output,
        testcase_input_file,
        testcase_output_file,
    };
}

function validateProblemMeta(meta) {
    const requiredFields = ['problem_number', 'title', 'category', 'points', 'is_published', 'created_at', 'sample', 'testcase'];
    for (const field of requiredFields) {
        if (!(field in meta)) {
            throw new Error(`meta.json に必須フィールド '${field}' がありません。`);
        }
    }
}

function validateTestcase(dirPath, meta) {
    const fields = ['sample', 'testcase'];
    const fileNames = ['input', 'output'];
    for (const field of fields) {
        for (const file of fileNames) {
            if (!meta[field][file]) {
                continue;
            }
            const fp = path.join(dirPath, meta[field][file]);
            if (!fs.existsSync(fp)) {
                throw new Error(`ファイル'${fp}'がありません。`);
            }
        }
    }
}


function insertProblem(problem) {
    const stmt = db.prepare(`
        INSERT INTO problems (
            problem_number,
            title,
            description,
            category,
            points,
            is_published,
            created_at,
            sample_input,
            sample_output,
            testcase_input_file,
            testcase_output_file
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(problem_number) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            category = excluded.category,
            points = excluded.points,
            is_published = excluded.is_published,
            created_at = excluded.created_at,
            sample_input = excluded.sample_input,
            sample_output = excluded.sample_output,
            testcase_input_file = excluded.testcase_input_file,
            testcase_output_file = excluded.testcase_output_file;
    `);

    stmt.run(
        problem.problem_number,
        problem.title,
        problem.description,
        problem.category,
        problem.points,
        problem.is_published ? 1 : 0,
        problem.created_at,
        problem.sample_input,
        problem.sample_output,
        problem.testcase_input_file,
        problem.testcase_output_file,
    );
}

function main() {
    initializeSchema();
    const problemsDir = path.join(__dirname, '..', 'problems');
    const subdirs = fs.readdirSync(problemsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const subdir of subdirs) {
        const fullPath = path.join(problemsDir, subdir);
        try {
            const problem = loadProblemFromDir(fullPath);
            insertProblem(problem);
            console.log(`Inserted: Problem ${problem.problem_number} - ${problem.title}`);
        } catch (err) {
            console.error(`Failed to insert ${subdir}:`, err.message);
        }
    }
}

main();


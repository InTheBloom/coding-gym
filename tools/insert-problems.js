const fs = require('fs');
const path = require('path');
const { db } = require('../db');

function loadProblemFromDir(dirPath) {
    const metaPath = path.join(dirPath, 'meta.json');
    const descriptionPath = path.join(dirPath, 'description.md');

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    validateProblemMeta(meta);
    const description = fs.readFileSync(descriptionPath, 'utf-8');

    return {
        ...meta,
        description,
    };
}

function validateProblemMeta(meta) {
    const requiredFields = ['problem_number', 'title', 'category', 'points', 'is_published', 'created_at'];
    for (const field of requiredFields) {
        if (!(field in meta)) {
            throw new Error(`meta.json に必須フィールド '${field}' がありません。`);
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
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(problem_number) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            category = excluded.category,
            points = excluded.points,
            is_published = excluded.is_published,
            created_at = excluded.created_at;
    `);

    stmt.run(
        problem.problem_number,
        problem.title,
        problem.description,
        problem.category,
        problem.points,
        problem.is_published ? 1 : 0,
        problem.created_at,
    );
}

function main() {
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


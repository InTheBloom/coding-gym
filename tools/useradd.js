// chatGPT製ユーザーINSERTツール

const crypto = require('crypto');
const { db } = require('../db');

// 引数の手動パース（例: --username alice --password secret）
const args = process.argv.slice(2);
let username = null;
let password = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username') {
        username = args[i + 1];
        i++;
    } else if (args[i] === '--password') {
        password = args[i + 1];
        i++;
    }
}

if (!username || !password) {
    console.error("使い方: node tools/addUser.js --username <名前> --password <パスワード>");
    process.exit(1);
}

// SHA256でハッシュ化（dbと同様の方法）
const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

try {
    const stmt = db.prepare(`
        INSERT INTO users (username, password_hash)
        VALUES (?, ?)
    `);
    stmt.run(username, hashedPassword);
    console.log(`✅ ユーザー '${username}' を追加しました`);
} catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error(`⚠️ ユーザー名 '${username}' は既に存在します`);
    } else {
        console.error("❌ エラー:", err);
    }
    process.exit(1);
}


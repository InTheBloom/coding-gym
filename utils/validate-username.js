function isValidUsername(username) {
    if (typeof username !== 'string') {
        return {
            isValid: false,
            reason: "ユーザ名が文字列ではありません。"
        };
    }

    if (username.length < 3 || username.length > 32) {
        return {
            isValid: false,
            reason: "ユーザ名は3文字以上32文字以下である必要があります。"
        };
    }

    const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
    if (!USERNAME_REGEX.test(username)) {
        return {
            isValid: false,
            reason: "ユーザ名には英大小文字・数字・アンダースコア(_)・ハイフン(-)のみ使用できます。"
        };
    }

    return {
        isValid: true
    };
}

module.exports = { isValidUsername };

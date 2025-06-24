function isValidPassword(password) {
    if (typeof password !== 'string') {
        return {
            isValid: false,
            reason: "パスワードが文字列ではありません。"
        };
    }
    if (password.length < 8 || 32 < password.length) {
        return {
            isValid: false,
            reason: "パスワードは8文字以上32文字以下である必要があります。"
        };
    }

    const ALP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alp = "abcdefghijklmnopqrstuvwxyz";
    const num = "0123456789";
    const sym = "!\"#$%&'()-=^~\\|@`[{]}*:+;?/_.>,<";

    const allowedChars = [ALP, alp, num, sym];

    let stat = 0;
    const st = new Set();
    for (const pch of password) {
        let match = false;
        for (let i = 0; i < allowedChars.length; i++) {
            for (const ch of allowedChars[i]) {
                if (pch == ch) {
                    match = true;
                    st.add(i);
                }
            }
        }

        if (!match) {
            return {
                isValid: false,
                reason: `パスワードに'${pch}'は使用できません。`
            };
        }
    }

    if (st.size < 3) {
        return {
            isValid: false,
            reason: "パスワードは英大文字、英子文字、数字、記号のうち少なくとも3種類を含めてください。"
        };
    }

    return {
        isValid: true,
    };
}

module.exports = { isValidPassword };

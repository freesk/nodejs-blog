function createToken() {
    var res = "";
    var foo = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < 32; i++)
        res += foo.charAt(Math.floor(Math.random() * foo.length));

    return text;
}

module.exports = createToken;

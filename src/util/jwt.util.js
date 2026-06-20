const jwt = require("jsonwebtoken");

module.exports.generateAccessToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            roleId: user.roleId
        },
        process.env.ACCESS_TOKEN_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    );
};

module.exports.generateRefreshToken = (user) => {

    return jwt.sign(
        {
            id: user.id
        },
        process.env.REFRESH_TOKEN_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    );
};


module.exports.verifyAccessToken = (token) => {

    return jwt.verify(
        token,
        process.env.ACCESS_TOKEN_KEY
    );
};


module.exports.verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        process.env.REFRESH_TOKEN_KEY
    );
};
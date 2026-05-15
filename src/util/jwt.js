const jwt = require("jsonwebtoken");
module.exports.generateAccessToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            roleId: user.roleId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.ACCESSTOKEN_ExpiresIn
        }
    );
};

module.exports.generateRefreshToken = (user) => {

    return jwt.sign(
        {
            id: user.id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFESHTOKEN_ExpiresIn
        }
    );
};


module.exports.verifyAccessToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );
};


module.exports.verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );
};
const AccessTokenModel = require("../models/access_token/access_token.model");

async function authenticate_route(req, res, next, required_role) {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: "No credentials sent!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const access_token = await AccessTokenModel.getToken(token);
    if (!access_token || access_token.role !== required_role) {
        return res
            .status(403)
            .json({ message: "You do not have permissions for this operation!" });
    }
    req.body.creator_username = access_token.username;
    next();
}

module.exports = authenticate_route;

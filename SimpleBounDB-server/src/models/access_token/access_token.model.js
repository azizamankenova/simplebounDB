const { db } = require("../../services/db");

const AccessTokenModel = {
    getToken: async function (token) {
        const access_token = (await db.query(
            `SELECT *
            FROM access_tokens
            WHERE token=$1`,
            [token]
        )).rows[0];

        if (access_token &&
            Math.round((Date.now() - access_token.created_at) / 1000) >
            process.env.ACCESS_TOKEN_LIFE
        ) {
            return null;
        }

        return access_token
    },
    getTokenByUsername: async function (username) {
        const access_token = (await db.query(
            `SELECT *
            FROM access_tokens
            WHERE username=$1`,
            [username]
        )).rows[0];

        if (access_token &&
            Math.round((Date.now() - access_token.created_at) / 1000) >
            process.env.ACCESS_TOKEN_LIFE
        ) {
            return null;
        }

        return access_token
    },
    addToken: async function (username, token, role) {
        const access_token = (await db.query(
            `SELECT *
            FROM access_tokens
            WHERE username=$1`,
            [username]
        )).rows[0];

        if (access_token) {
            return(
                await db.query(
                    `UPDATE access_tokens SET
                    token=$1, created_at=$2
                    WHERE username=$3
                    RETURNING *`,
                    [token, new Date().toISOString().slice(0, 19).replace('T', ' '), username]
                )
            ).rows[0];
        }
        else {
            return(
                await db.query(
                    `INSERT INTO access_tokens
                    (username, token, role)
                    VALUES
                    ($1, $2, $3)
                    RETURNING *`,
                    [username, token, role]
                )
            ).rows[0];
        }
        
    }
}

module.exports = AccessTokenModel;
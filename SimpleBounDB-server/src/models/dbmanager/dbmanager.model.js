const { db } = require("../../services/db");

const DbManagerModel = {
    registerManager: async function(username, password) {
        return (await db.query(
            `INSERT INTO database_managers
            (username, password)
            VALUES
            ($1, $2)
            RETURNING *`,
            [username, password]
        )).rows[0];
    },
    getDbManagerByUsername: async function (username) {
        return (await db.query(
            `SELECT *
            FROM database_managers
            WHERE username=$1`,
            [username]
        )).rows[0];
    },
    
    
}

module.exports = DbManagerModel;
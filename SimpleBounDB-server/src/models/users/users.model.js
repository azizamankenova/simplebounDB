const { db } = require("../../services/db");

const UserModel = {
    createUser: async function(username, password, name, surname, email, department_id) {
        return (await db.query(
            `INSERT INTO users
            (username, password, name, surname, email, department_id)
            VALUES
            ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [username, password, name, surname, email, department_id]
        )).rows[0];
    },
    getUserByUsername: async function(username) {
        return (await db.query(
            `SELECT *
            FROM users
            WHERE username=$1`,
            [username]
        )).rows[0];
    },
    deleteUser:  async function(username) {
        return (await db.query(
            `DELETE FROM users
            WHERE username=$1
            RETURNING *`,
            [username]
        )).rows[0];
    }
}

module.exports = UserModel;
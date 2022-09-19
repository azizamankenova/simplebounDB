const { db } = require("../../services/db");
const UserModel = require("../users/users.model");

const StudentModel = {
    addStudent: async function (
        username,
        password,
        name,
        surname,
        email,
        department_id,
        student_id
    ) {
        const user = UserModel.createUser(
            username,
            password,
            name,
            surname,
            email,
            department_id
        );
        if (user) {
            return (
                await db.query(
                    `INSERT INTO students
                    (student_id, username)
                    VALUES
                    ($1, $2)
                    RETURNING *`,
                    [student_id, username]
                )
            ).rows[0];
        }
    },
    getStudentByStudentID: async function (student_id) {
        return (await db.query(
            `SELECT *
            FROM students
            WHERE student_id=$1`,
            [student_id]
        )).rows[0];
    },
    getAllStudentsASCCredits: async function () {
        return (await db.query(
            `SELECT s.username, name, surname, email, department_id, completed_credits, gpa
            FROM students as s
            INNER JOIN users as u on s.username=u.username
            ORDER BY completed_credits ASC`,
            []
        )).rows;
    },
    deleteStudent: async function (student_id) {
        const student = await this.getStudentByStudentID(student_id);
        if (student) {
            return await UserModel.deleteUser(student.username);
        }
        return null;
    },
    getStudentByUsername: async function (username) {
        return (await db.query(
            `SELECT *
            FROM students as s
            INNER JOIN users as u on s.username=u.username
            WHERE s.username=$1`,
            [username]
        )).rows[0];
    },
    getAllGradesByStudentId: async function (student_id) {
        return (await db.query(
            `SELECT g.course_id, c.name AS course_name, g.grade
            FROM grades as g
            INNER JOIN courses as c on g.course_id=c.course_id
            WHERE g.student_id=$1`,
            [student_id]
        )).rows;
    },
};

module.exports = StudentModel;

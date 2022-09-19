const { db } = require("../../services/db");
const UserModel = require("../users/users.model");

const InstructorModel = {
    addInstructor: async function (
        username,
        password,
        name,
        surname,
        email,
        department_id,
        title
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
                    `INSERT INTO instructors
                    (title, username)
                    VALUES
                    ($1, $2)
                    RETURNING *`,
                    [title, username]
                )
            ).rows[0];
        }
    },
    getInstructorByUsername: async function (username) {
        return (await db.query(
            `SELECT *
            FROM instructors as i
            INNER JOIN users as u on i.username=u.username
            WHERE i.username=$1`,
            [username]
        )).rows[0];
    },
    updateInstructorTitle: async function (
        username,
        title
    ) {
        return (
            await db.query(
                `UPDATE instructors
                SET title=$2
                WHERE username=$1
                RETURNING *`,
                [username, title]
            )
        ).rows[0];
    },
    getAllInstructors: async function () {
        return (await db.query(
            `SELECT i.username, name, surname, email, department_id, i.title
            FROM instructors as i
            INNER JOIN users as u on i.username=u.username`,
            []
        )).rows;
    },
    getAllCoursesByInstructorUsername: async function (instructor_username) {
        return (await db.query(
            `SELECT c.course_id, c.name AS course_name, c.classroom_id, s.campus, c.slot AS time_slot
            FROM courses as c
            INNER JOIN classrooms as s on c.classroom_id=s.classroom_id
            WHERE c.instructor_username=$1`,
            [instructor_username]
        )).rows;
    },

};

module.exports = InstructorModel;

const { db } = require("../../services/db");

const CourseModel = {
    addCourse: async function (
        course_id,
        name,
        credits,
        quota,
        classroom_id,
        slot,
        instructor_username
    ) {
        try {
            const course = (
                await db.query(
                    `INSERT INTO courses
                    (course_id, name, credits, quota, classroom_id, slot, instructor_username)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`,
                    [
                        course_id,
                        name,
                        credits,
                        quota,
                        classroom_id,
                        slot,
                        instructor_username,
                    ]
                )
            );
            return course.rows[0];
        } catch (e) {
            return null;
        }
    },
    addPrerequisite: async function (course_id, prerequisite_course_id) {
        try {
            const prereq = (
                await db.query(
                    `INSERT INTO prerequisites
                    (course_id, prerequisite_course_id)
                    VALUES ($1, $2)
                    RETURNING *`,
                    [course_id, prerequisite_course_id]
                )
            ).rows[0];
            return prereq;
        } catch (e) {
            return null;
        }
    },
    getCourseByID: async function (course_id) {
        return (
            await db.query(
                `SELECT *
                FROM courses
                WHERE course_id = $1`,
                [course_id]
            )
        ).rows[0];
    },
    getAllCourseByInstructor: async function (instructor_username) {
        const res = await db.query(
            `SELECT *
            FROM courses
            WHERE instructor_username = $1
            ORDER BY course_id ASC`,
            [instructor_username]
        )
        console.log(res)
        return res.rows;
    },
    getPrerequisites: async function (course_id) {
        return (
            await db.query(
                `SELECT prerequisite_course_id
                FROM prerequisites
                WHERE course_id = $1`,
                [course_id]
            )
        ).rows;
    },
    getStudents: async function (course_id) {
        return (
            await db.query(
                `SELECT u.username, a.student_id, u.email, u.name, u.surname
                FROM added_courses as a
                INNER JOIN students as s on s.student_id = a.student_id
                INNER JOIN users as u on s.username=u.username
                WHERE course_id = $1`,
                [course_id]
            )
        ).rows;
    },
    updateNameOfCourse: async function (course_id, name) {
        return (
            await db.query(
                `UPDATE courses
                SET name=$1
                WHERE course_id=$2
                RETURNING *`,
                [name, course_id]
            )
        ).rows[0];
    },
    addGrade: async function (course_id, student_id, grade) {
        return (
            await db.query(
                `INSERT INTO grades
                (course_id, student_id, grade)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [course_id, student_id, grade]
            )
        ).rows[0];
    },
    getGradeAvgByCourseID: async function (course_id) {
        return (
            await db.query(
                `SELECT g.course_id, c.name AS course_name, AVG(g.grade) AS grade_average
                FROM grades as g
                INNER JOIN courses as c on g.course_id=c.course_id
                WHERE g.course_id=$1
                GROUP BY g.course_id,c.name`,
                [course_id]
            )
        ).rows[0];
    },
    getAllCourses: async function () {
        return (
            await db.query(
                `SELECT c.course_id, c.name, u.surname AS instructor_surname, u.department_id,
                c.credits, c.classroom_id, c.slot, c.quota,
                string_agg(prerequisite_course_id, ', ') AS prerequisites
                FROM courses as c
                INNER JOIN users as u on u.username=c.instructor_username
                LEFT JOIN prerequisites as p on p.course_id=c.course_id
                GROUP BY c.course_id,u.surname,u.department_id`,
                []
            )
        ).rows;
    },
    getGradesByStudentIdCourseID: async function (course_id, student_id) {
        return (
            await db.query(
                `SELECT *
                FROM grades
                WHERE student_id=$1 AND course_id=$2`,
                [student_id, course_id]
            )
        ).rows[0];
    },
    getQuotaByCourseID: async function (course_id) {
        return (
            await db.query(
                `SELECT quota
                FROM courses
                WHERE course_id = $1`,
                [course_id]
            )
        ).rows[0];
    },
    getNumberOfStudentsRegistered: async function (course_id) {
        return (
            await db.query(
                `SELECT COUNT(*)
                FROM added_courses
                WHERE course_id = $1`,
                [course_id]
            )
        ).rows[0];
    },
    addCourseToAddedCourses: async function (student_id, course_id) {
        try {
            const course = (
                await db.query(
                    `INSERT INTO added_courses (student_id, course_id)
                    VALUES ($1, $2)
                    RETURNING *`,
                    [student_id, course_id]
                )
            ).rows[0];
            return course;
        } catch (e) {
            return null;
        }
    },
    getAllCoursesEnrolled: async function (student_id) {
        return (
            await db.query(
                `SELECT c.course_id, c.name AS course_name, g.grade
                FROM grades AS g
                FULL JOIN added_courses as a on a.course_id=g.course_id AND a.student_id=g.student_id
                INNER JOIN courses AS c ON c.course_id=g.course_id OR c.course_id=a.course_id
                WHERE g.student_id=$1 OR a.student_id=$1`,
                [student_id]
            )
        ).rows;
    },
    searchCoursesContainingKeyword: async function (keyword) {
        return (
            await db.query(
                `SELECT c.course_id, c.name, u.surname AS instructor_surname, u.department_id,
                c.credits, c.classroom_id, c.slot, c.quota,
                string_agg(prerequisite_course_id, ', ') AS prerequisites
                FROM courses as c
                INNER JOIN users as u on u.username=c.instructor_username
                LEFT JOIN prerequisites as p on p.course_id=c.course_id
                GROUP BY c.course_id,u.surname,u.department_id 
                HAVING POSITION(LOWER($1) in LOWER(c.name))>0;`,
                [keyword]
            )
        ).rows;
    },
    checkAddedCourse: async function (student_id, course_id) {
        return (
            await db.query(
                `SELECT *
                FROM added_courses AS a
                WHERE a.student_id=$1 AND a.course_id=$2`,
                [student_id, course_id]
            )
        ).rows[0];
    },
    deleteCourse: async function (student_id, course_id) {
        return (
            await db.query(
                `DELETE FROM added_courses AS a
                WHERE a.student_id=$1 AND a.course_id=$2
                RETURNING *`,
                [student_id, course_id]
            )
        ).rows[0];
    },
    filterCourses: async function (department_id, campus, min_credits, max_credits) {
        return (
            await db.query(
                `SELECT *
                FROM filter_courses($1, $2, $3, $4)`,
                [department_id, campus, min_credits, max_credits]
            )
        ).rows;
    },
};

module.exports = CourseModel;

const { db } = require("../../services/db");

const ClassroomModel = {
    getAllClassroomsAtSlot: async function (slot) {
        return (await db.query(
            `SELECT DISTINCT c.classroom_id, campus, classroom_capacity
            FROM courses
            RIGHT JOIN classrooms c on c.classroom_id = courses.classroom_id
            WHERE
                c.classroom_id NOT IN
                (
                    SELECT c1.classroom_id
                    FROM courses AS c1
                    WHERE c1.slot = $1
                )
            ;`,
            [slot]
        )).rows;
    },
    getClassroomByID: async function (classroom_id) {
        return (await db.query(
            `SELECT *
            FROM classrooms
            WHERE classroom_id = $1`,
            [classroom_id]
        )).rows[0];
    },
};

module.exports = ClassroomModel;

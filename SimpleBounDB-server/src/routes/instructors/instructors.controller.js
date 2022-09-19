const crypto = require("crypto");
const { checkPassword } = require("../../services/password");
const InstructorModel = require("../../models/instructor/instructor.model");
const AccessTokenModel = require("../../models/access_token/access_token.model");
const ClassroomModel = require("../../models/classroom/classroom.model");
const CourseModel = require("../../models/course/course.model");
const StudentModel = require("../../models/student/student.model");

const InstructorsController = {
    login: async function (req, res) {
        const { username, password } = req.body;

        const instructor = await InstructorModel.getInstructorByUsername(
            username
        );

        if (
            instructor &&
            checkPassword(password, instructor.password)
        ) {
            const token = crypto.randomBytes(64).toString("hex");
            const a_token = await AccessTokenModel.getTokenByUsername(username);
            if (!a_token) {
                const access_token = await AccessTokenModel.addToken(
                    username,
                    token,
                    "instructor"
                );
                if (access_token) {
                    return res
                        .status(200)
                        .json({ access_token: access_token.token });
                }
            } else {
                return res.status(200).json({ access_token: a_token.token });
            }
        }
        return res.status(401).json({ message: "Unauthorized user" });
    },

    allClassroomsAtSlot: async function (req, res) {
        const { slot } = req.params;
        if (slot >= 1 && slot <= 10) {
            const classrooms = await ClassroomModel.getAllClassroomsAtSlot(slot);
            if (classrooms) {
                return res.status(200).json({ classrooms });
            }
        }
        return res.status(400).json({ message: "Could not retrieve classrooms" });
    },

    addCourse: async function (req, res) {
        const {
            course_id,
            name,
            credits,
            classroom_id,
            slot,
            quota,
            creator_username,
        } = req.body;

        const classroom = await ClassroomModel.getClassroomByID(classroom_id);

        if (classroom) {
            const course = await CourseModel.addCourse(
                course_id,
                name,
                credits,
                quota,
                classroom_id,
                slot,
                creator_username
            );

            if (course) {
                return res.status(200).json({ message: "Successfully added course" });
            }
        }

        return res.status(400).json({ message: "Could not create a course" });
    },

    addPrerequisite: async function (req, res) {
        const { course_id, prerequisite_course_id, creator_username } =
            req.body;

        const course = await CourseModel.getCourseByID(course_id);

        if (!course || course.instructor_username !== creator_username) {
            return res
                .status(403)
                .json({
                    message: "You do not have permissions for this operation!",
                });
        }

        const prereq = await CourseModel.addPrerequisite(
            course_id,
            prerequisite_course_id
        );

        if (prereq) {
            return res
                .status(200)
                .json({ message: "Successfully added a prerequisite" });
        }

        return res
            .status(400)
            .json({ message: "Could not add a prerequisite" });
    },

    listCourseByInstructor: async function (req, res) {
        const { creator_username } = req.body;

        const courses = await CourseModel.getAllCourseByInstructor(creator_username);

        if (courses) {
            if (courses.length > 0) {
                await (new Promise((resolve, reject) => {
                    courses.forEach(async (course, index) => {
                        const prereqs = await CourseModel.getPrerequisites(course.course_id);
                        course.prerequisites = prereqs.map(prereq => prereq.prerequisite_course_id).join(", ");
                        if (index === courses.length - 1) resolve();
                    })
                }))
            }
            
            return res.status(200).json({ courses });
        }

        return res.status(400).json({ message: "Could not retrieve courses" });
    },

    listStudentsOfCourse: async function (req, res) {
        const { course_id } = req.params;
        const { creator_username } = req.body;

        const course = await CourseModel.getCourseByID(course_id)

        if (!course || course.instructor_username !== creator_username) {
            return res
                .status(403)
                .json({
                    message: "You do not have permissions for this operation!",
                });
        }

        const students = await CourseModel.getStudents(course_id);

        if (students) {
            return res.status(200).json({ students });
        }

        return res.status(400).json({ message: "Could not retrieve students" });
    },

    updateNameOfCourse: async function (req, res) {
        const { course_id, name, creator_username } = req.body;

        const course = await CourseModel.getCourseByID(course_id)

        if (!course || course.instructor_username !== creator_username) {
            return res
                .status(403)
                .json({
                    message: "You do not have permissions for this operation!",
                });
        }

        const new_course = await CourseModel.updateNameOfCourse(course_id, name);

        if (new_course) {
            return res.status(200).json({ message: "Successfully updated name of course" });
        }

        return res.status(400).json({ message: "Could not change name of course" });
    },

    giveGrade: async function (req, res) {
        const { course_id, student_id, grade, creator_username } = req.body;

        const course = await CourseModel.getCourseByID(course_id)

        if (!course || course.instructor_username !== creator_username) {
            return res
                .status(403)
                .json({
                    message: "You do not have permissions for this operation!",
                });
        }

        const student = await StudentModel.getStudentByStudentID(student_id);

        if (student) {
            const added_course = await CourseModel.checkAddedCourse(student_id, course_id);
            
            if(added_course) {
                const inserted_grade = await CourseModel.addGrade(course_id, student_id, grade);

                if (inserted_grade) {
                    await CourseModel.deleteCourse(student_id, course_id);
                    return res.status(200).json({ message: "Successfully added grade to student" });
                }
            }
        }

        return res.status(400).json({ message: "Could not add grade" });
    }
};

module.exports = InstructorsController;

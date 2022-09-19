const crypto = require("crypto");
const { encryptPassword, checkPassword } = require("../../services/password");
const DbManagerModel = require("../../models/dbmanager/dbmanager.model");
const StudentModel = require("../../models/student/student.model");
const UserModel = require("../../models/users/users.model");
const InstructorModel = require("../../models/instructor/instructor.model");
const AccessTokenModel = require("../../models/access_token/access_token.model");
const CourseModel = require("../../models/course/course.model");

const DbManagerController = {
    register: async function (req, res) {
        const { username, password } = req.body;

        //Encrypt user password
        const encryptedPassword = encryptPassword(password);

        const manager = await DbManagerModel.registerManager(
            username,
            encryptedPassword
        );

        return res.status(200).json({ manager });
    },

    login: async function (req, res) {
        const { username, password } = req.body;

        const manager = await DbManagerModel.getDbManagerByUsername(username);

        if (
            manager &&
            checkPassword(password, manager.password)
        ) {
            const token = crypto.randomBytes(64).toString("hex");
            const a_token = await AccessTokenModel.getTokenByUsername(username);
            if (!a_token) {
                const access_token = await AccessTokenModel.addToken(
                    username,
                    token,
                    "db_manager"
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

    addUser: async function (req, res) {
        const {
            username,
            password,
            name,
            surname,
            email,
            department_id,
            student_id,
            title,
        } = req.body;

        const user = await UserModel.getUserByUsername(username);

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        //Encrypt user password
        const encryptedPassword = encryptPassword(password);

        if (student_id) {
            const student = await StudentModel.addStudent(
                username,
                encryptedPassword,
                name,
                surname,
                email,
                department_id,
                student_id
            );

            if (student) {
                return res
                    .status(201)
                    .json({ message: "Successfully created a student." });
            }
        } else if (title) {
            if (
                ![
                    "Assistant Professor",
                    "Associate Professor",
                    "Professor",
                ].includes(title)
            ) {
                return res
                    .status(400)
                    .json({ message: "Invalid title provided for instructor" });
            }

            const instructor = await InstructorModel.addInstructor(
                username,
                encryptedPassword,
                name,
                surname,
                email,
                department_id,
                title
            );

            if (instructor) {
                return res
                    .status(201)
                    .json({ message: "Successfully created an instructor." });
            }
        }

        return res.status(400).json({ message: "Could not add a new user." });
    },

    deleteStudent: async function (req, res) {
        const { student_id } = req.params;

        const student = await StudentModel.deleteStudent(student_id);
        if (student) {
            return res
                .status(200)
                .json({ message: "Student successfully deleted." });
        }
        return res
            .status(400)
            .json({ message: "Could not delete the student." });
    },

    updateInstructorTitle: async function (req, res) {
        const { username, title } = req.body;

        const instructor = await InstructorModel.getInstructorByUsername(
            username
        );

        if (instructor) {
            const instr = await InstructorModel.updateInstructorTitle(
                username,
                title
            );
            if (instr) {
                return res.status(200).json({
                    message: "Instructor's title is successfully updated.",
                });
            }
        }
        return res
            .status(400)
            .json({ message: "Could not update instructor's title." });
    },

    getAllStudents: async function (req, res) {
        const students = await StudentModel.getAllStudentsASCCredits();
        if (students) {
            return res.status(200).json({
                students,
            });
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve all students." });
    },
    getAllInstructors: async function (req, res) {
        const instructors = await InstructorModel.getAllInstructors();
        if (instructors) {
            return res.status(200).json({
                instructors,
            });
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve instructors." });

    },
    getAllGradesByStudentId: async function (req, res) {
        const { student_id } = req.params;
        const student = await StudentModel.getStudentByStudentID(student_id);
        if (student) {
            const grades = await StudentModel.getAllGradesByStudentId(student_id);
            if (grades) {
                return res.status(200).json({
                    grades,
                });
            }
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve grades of the student." });
    },
    getAllCoursesByInstructor: async function (req, res) {
        const { instructor_username } = req.params;
        const instructor = await InstructorModel.getInstructorByUsername(
            instructor_username
        );

        if (instructor) {
            const courses = await InstructorModel.getAllCoursesByInstructorUsername(instructor_username);
            if (courses) {
                return res.status(200).json({
                    courses,
                });
            }
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve courses of the instructor." });

    },
    getCourseAverage: async function (req, res) {
        const { course_id } = req.params;
        const grade_average = await CourseModel.getGradeAvgByCourseID(course_id);
        if (grade_average) {
            return res.status(200).json({
                grade_average,
            });
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve grade average of the course." });

    },
};

module.exports = DbManagerController;

const crypto = require("crypto");
const { checkPassword } = require("../../services/password");
const StudentModel = require("../../models/student/student.model");
const AccessTokenModel = require("../../models/access_token/access_token.model");
const CourseModel = require("../../models/course/course.model");

const StudentsController = {
    login: async function (req, res) {
        const { username, password } = req.body;

        const student = await StudentModel.getStudentByUsername(username);

        if (
            student &&
            checkPassword(password, student.password)
        ) {
            const token = crypto.randomBytes(64).toString("hex");
            const a_token = await AccessTokenModel.getTokenByUsername(username);
            if (!a_token) {
                const access_token = await AccessTokenModel.addToken(
                    username,
                    token,
                    "student"
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
    getAllCourses: async function (req, res) {
        const courses = await CourseModel.getAllCourses();

        if (courses) {
            return res.status(200).json({
                courses,
            });
        }
        return res
            .status(400)
            .json({ message: "Could not retrieve the courses." });
    },
    addCourseByCourseID: async function (req, res) {
        const { course_id, creator_username } = req.body;
        const student = await StudentModel.getStudentByUsername(
            creator_username
        );
        const grades = await CourseModel.getGradesByStudentIdCourseID(
            course_id,
            student.student_id
        );
        const prereq = await CourseModel.getPrerequisites(course_id);

        if (!grades) {
            for (prer of prereq) {
                const grade = await CourseModel.getGradesByStudentIdCourseID(
                    prer.prerequisite_course_id,
                    student.student_id
                );
                if (!grade) {
                    return res
                        .status(400)
                        .json({
                            message:
                                "Cannot add course due to prerequisite constraint.",
                        });
                }
            }
            const quota = await CourseModel.getQuotaByCourseID(course_id);
            const count_registered =
                await CourseModel.getNumberOfStudentsRegistered(course_id);
            if (
                quota &&
                count_registered &&
                count_registered.count < quota.quota
            ) {
                const added_course = await CourseModel.addCourseToAddedCourses(
                    student.student_id,
                    course_id
                );
                return res.status(200).json({
                    message: "Successfully added course",
                });
            } else {
                if (quota) {
                    return res
                        .status(400)
                        .json({
                            message: "Cannot add course due to full quota",
                        });
                }
            }
        }
        return res.status(400).json({ message: "Cannot add course" });
    },
    getAllCoursesEnrolled: async function (req, res) {
        const { creator_username } = req.body;
        const student = await StudentModel.getStudentByUsername(
            creator_username
        );
        const all_courses_enrolled = await CourseModel.getAllCoursesEnrolled(
            student.student_id
        );
        if (all_courses_enrolled) {
            return res.status(200).json({
                all_courses_enrolled,
            });
        }
        return res.status(400).json({ message: "Cannot retrieve the courses" });
    },
    searchCourses: async function (req, res) {
        const { keyword } = req.params;
        const courses = await CourseModel.searchCoursesContainingKeyword(
            keyword
        );
        if (courses) {
            return res.status(200).json({
                courses,
            });
        }
        return res
            .status(400)
            .json({ message: "Cannot find courses containing the keyword" });
    },
    filterCourses: async function (req, res) {
        const { department_id, campus, min_credits, max_credits } = req.body;
        const courses = await CourseModel.filterCourses(
            department_id, campus, min_credits, max_credits
        );
        if (courses) {
            return res.status(200).json({
                courses,
            });
        }
        return res
            .status(400)
            .json({ message: "Cannot find courses containing the keyword" });
    },
};

module.exports = StudentsController;

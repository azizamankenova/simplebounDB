const express = require("express");
const { validate } = require("./dbmanager.validate");
const { handleValidation } = require("../../services/validate");
const authenticate_route = require("../../services/auth");
const DbManagerController = require("./dbmanager.controller");

const dbmanagerRouter = express.Router();

dbmanagerRouter.post(
    "/register",
    validate("register"),
    handleValidation,
    DbManagerController.register
);
dbmanagerRouter.post(
    "/login",
    validate("login"),
    handleValidation,
    DbManagerController.login
);
dbmanagerRouter.post(
    "/add_user",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    validate("add_user"),
    handleValidation,
    DbManagerController.addUser
);
dbmanagerRouter.delete(
    "/delete_student/:student_id",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.deleteStudent
);
dbmanagerRouter.post(
    "/update_instructor_title",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    validate("update_instructor_title"),
    handleValidation,
    DbManagerController.updateInstructorTitle
);
dbmanagerRouter.get(
    "/get_all_students",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.getAllStudents
);
dbmanagerRouter.get(
    "/get_all_instructors",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.getAllInstructors
);
dbmanagerRouter.get(
    "/get_all_grades/:student_id",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.getAllGradesByStudentId
);
dbmanagerRouter.get(
    "/get_all_courses_instructor/:instructor_username",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.getAllCoursesByInstructor
);
dbmanagerRouter.get(
    "/get_course_average/:course_id",
    (req, res, next) => authenticate_route(req, res, next, "db_manager"),
    DbManagerController.getCourseAverage
);

module.exports = dbmanagerRouter;

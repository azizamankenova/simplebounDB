const express = require("express");
const { validate } = require("./students.validate");
const { handleValidation } = require("../../services/validate");
const authenticate_route = require("../../services/auth");
const StudentsController = require("./students.controller");

const studentsRouter = express.Router();

studentsRouter.post(
    "/login",
    validate("login"),
    handleValidation,
    StudentsController.login
);
studentsRouter.get(
    "/get_courses",
    (req, res, next) => authenticate_route(req, res, next, "student"),
    StudentsController.getAllCoursesEnrolled
);
studentsRouter.post(
    "/add_course",
    (req, res, next) => authenticate_route(req, res, next, "student"),
    validate("add_course"),
    handleValidation,
    StudentsController.addCourseByCourseID
);
studentsRouter.get(
    "/get_all_courses",
    (req, res, next) => authenticate_route(req, res, next, "student"),
    StudentsController.getAllCourses
);
studentsRouter.get(
    "/search_courses/:keyword",
    (req, res, next) => authenticate_route(req, res, next, "student"),
    StudentsController.searchCourses
);
studentsRouter.post(
    "/filter_courses",
    (req, res, next) => authenticate_route(req, res, next, "student"),
    validate("filter_courses"),
    handleValidation,
    StudentsController.filterCourses
);

// (req, res, next) => authenticate_route(req, res, next, "student"),

module.exports = studentsRouter;

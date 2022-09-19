const express = require("express");
const { validate } = require("./instructors.validate");
const { handleValidation } = require("../../services/validate");
const authenticate_route = require("../../services/auth");
const InstructorsController = require("./instructors.controller");

const instructorsRouter = express.Router();

instructorsRouter.post(
    "/login",
    validate("login"),
    handleValidation,
    InstructorsController.login
);
instructorsRouter.get(
    "/all_classrooms_at_slot/:slot",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    InstructorsController.allClassroomsAtSlot
);
instructorsRouter.post(
    "/add_course",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    validate("add_course"),
    handleValidation,
    InstructorsController.addCourse
);
instructorsRouter.post(
    "/add_prerequisite",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    validate("add_prerequisite"),
    handleValidation,
    InstructorsController.addPrerequisite
);
instructorsRouter.get(
    "/get_courses",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    InstructorsController.listCourseByInstructor
);
instructorsRouter.get(
    "/students_of_course/:course_id",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    InstructorsController.listStudentsOfCourse
);
instructorsRouter.put(
    "/change_name_of_course",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    validate("change_name_of_course"),
    handleValidation,
    InstructorsController.updateNameOfCourse
);
instructorsRouter.post(
    "/give_grade",
    (req, res, next) => authenticate_route(req, res, next, "instructor"),
    validate("give_grade"), 
    handleValidation,
    InstructorsController.giveGrade
);

module.exports = instructorsRouter;

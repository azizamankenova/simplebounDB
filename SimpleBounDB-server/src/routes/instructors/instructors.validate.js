const { body } = require("express-validator");

exports.validate = (method) => {
    switch (method) {
        case "login": {
            return [
                body("username", "username doesn't exist").exists(),
                body("password", "password doesn't exist").exists(),
            ];
        }
        case "add_course": {
            return [
                body("course_id", "course_id doesn't exist").exists(),
                body("name", "name doesn't exist").exists(),
                body("credits", "credits doesn't exist").exists().isInt(),
                body("classroom_id", "classroom_id doesn't exist").exists(),
                body("slot", "slot doesn't exist")
                    .exists()
                    .isInt({ min: 1, max: 10 }),
                body("quota", "quota doesn't exist").exists().isInt(),
            ];
        }
        case "add_prerequisite": {
            return [
                body("course_id", "course_id doesn't exist").exists(),
                body(
                    "prerequisite_course_id",
                    "prerequisite_course_id doesn't exist"
                ).exists(),
            ];
        }
        case "students_of_course": {
            return [body("course_id", "course_id doesn't exist").exists()];
        }
        case "change_name_of_course": {
            return [
                body("course_id", "course_id doesn't exist").exists(),
                body("name", "name doesn't exist").exists(),
            ];
        }
        case "give_grade": {
            return [
                body("course_id", "course_id doesn't exist").exists(),
                body("student_id", "student_id doesn't exist").exists(),
                body("grade", "grade doesn't exist").exists().isFloat(),
            ];
        }
    }
};

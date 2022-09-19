const { body } = require("express-validator");

exports.validate = (method) => {
    switch (method) {
        case "login": {
            return [
                body("username", "username doesn't exist").exists(),
                body("password", "password doesn't exist").exists()
            ];
        }
        case "add_course": {
            return [
                body("course_id", "course_id doesn't exist").exists()
            ];
        }
        case "filter_courses": {
            return [
                body("department_id", "department_id doesn't exist").exists(),
                body("campus", "campus doesn't exist").exists(),
                body("min_credits", "min_credits doesn't exist").exists().isInt(),
                body("max_credits", "max_credits doesn't exist").exists().isInt(),
            ];
        }
    }
};

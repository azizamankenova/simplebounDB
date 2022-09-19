const { body } = require("express-validator");

exports.validate = (method) => {
    switch (method) {
        case "register": {
            return [
                body("username", "username doesn't exist").exists(),
                body("password", "password doesn't exist").exists()
            ];
        }
        case "login": {
            return [
                body("username", "username doesn't exist").exists(),
                body("password", "password doesn't exist").exists()
            ];
        }
        case "add_user": {
            return [
                body("username", "username doesn't exist").exists(),
                body("password", "password doesn't exist").exists(),
                body("name", "name doesn't exist").exists(),
                body("surname", "surname doesn't exist").exists(),
                body("email", "email doesn't exist").exists().isEmail(),
                body("department_id", "department_id doesn't exist").exists(),
            ];
        }
        case "update_instructor_title": {
            return [
                body("username", "username doesn't exist").exists(),
                body("title", "title doesn't exist").exists().isIn(["Assistant Professor", "Associate Professor", "Professor"])
            ];
        }


    }
};

const express = require("express");
const dbmanagerRouter = require("./dbmanager/dbmanager.route");
const instructorsRouter = require("./instructors/instructors.route");
const studentsRouter = require("./students/students.route");

const api = express.Router();

api.use("/dbmanagers", dbmanagerRouter);
api.use("/instructors", instructorsRouter);
api.use("/students", studentsRouter);

module.exports = {
  api,
};
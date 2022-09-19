import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import TabPanel from "../../components/TabPanel/TabPanel";
import { API_URL } from "../../next.config";
import * as Yup from "yup";
import MainLayout from "../../layouts/main/MainLayout";
import styles from "../../styles/dbmanagers/index.module.scss";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export default function Instructors({ setLoading }) {
    const [panel, setPanel] = useState(1);
    const [courses, setCourses] = useState([]);
    const [classrooms, setClassrooms] = useState(null);
    const [openAddCourse, setOpenAddCourse] = useState(false);
    const [openAddPrerequisite, setOpenAddPrerequisite] = useState(false);
    const [openChangeName, setOpenChangeName] = useState(false);
    const [students, setStudents] = useState(null);

    const handleChange = (event, newValue) => {
        setPanel(newValue);
    };

    const classroomColumns = [
        {
            field: "classroom_id",
            headerName: "Classroom ID",
            width: 150,
        },
        {
            field: "campus",
            headerName: "Campus",
            width: 250,
        },
        {
            field: "classroom_capacity",
            headerName: "Classroom Capacity",
            width: 200,
        },
    ];

    const courseColumns = [
        {
            field: "course_id",
            headerName: "Course ID",
            width: 150,
        },
        {
            field: "name",
            headerName: "Course Name",
            width: 300,
        },
        {
            field: "classroom_id",
            headerName: "Classroom",
            width: 130,
        },
        {
            field: "slot",
            headerName: "Slot",
            width: 130,
        },
        {
            field: "quota",
            headerName: "Quota",
            width: 130,
        },
        {
            field: "prerequisites",
            headerName: "Prerequisites",
            width: 300,
        },
    ];
    const studentColumns = [
        {
            field: "username",
            headerName: "Username",
            width: 150,
        },
        {
            field: "student_id",
            headerName: "Student ID",
            width: 150,
        },
        {
            field: "email",
            headerName: "Email",
            width: 250,
        },
        {
            field: "name",
            headerName: "Name",
            width: 130,
        },
        {
            field: "surname",
            headerName: "Surname",
            width: 130,
        },
    ];

    const AddCourseSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
        name: Yup.string().required("No name provided"),
        credits: Yup.number().integer().required("No credits provided"),
        classroom_id: Yup.string().required("No classroom_id provided"),
        slot: Yup.number()
            .integer()
            .required("No slot provided")
            .min(1)
            .max(10),
        quota: Yup.number().integer().required("No quota provided"),
    });

    const GetStudentsSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
    });

    const GiveGradeSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
        student_id: Yup.string().required("No student_id provided"),
        grade: Yup.number().required("No grade provided").min(0),
    });

    const AddPrerequisiteSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
        prerequisite_course_id: Yup.string().required(
            "No prerequisite_course_id provided"
        ),
    });

    const GetClassroomsSchema = Yup.object().shape({
        slot: Yup.number()
            .integer()
            .required("No slot provided")
            .min(1)
            .max(10),
    });

    const ChangeNameSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
        name: Yup.string().required("No new course name provided"),
    });

    const addCourse = async (values, { resetForm }) => {
        setOpenAddCourse(false);
        try {
            await axios.post(`${API_URL}/instructors/add_course`, values);
            getData();
            // resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const addPrerequisite = async (values, { resetForm }) => {
        setOpenAddPrerequisite(false);
        try {
            await axios.post(`${API_URL}/instructors/add_prerequisite`, values);
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const changeName = async (values, { resetForm }) => {
        setOpenChangeName(false);
        try {
            await axios.put(
                `${API_URL}/instructors/change_name_of_course`,
                values
            );
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const getClassrooms = async (values, { resetForm }) => {
        const res = await axios.get(
            `${API_URL}/instructors/all_classrooms_at_slot/${values.slot}`
        );
        const res_classrooms = res.data.classrooms;
        res_classrooms.forEach((classroom, i) => {
            classroom.id = i;
        });
        setClassrooms(res_classrooms);
        resetForm();
    };

    const getStudents = async (values, { resetForm }) => {
        const res = await axios.get(
            `${API_URL}/instructors/students_of_course/${values.course_id}`
        );
        const res_students = res.data.students;
        res_students.forEach((student, i) => {
            student.id = i;
        });
        setStudents(res_students);
        resetForm();
    };

    const giveGrade = async (values, { resetForm }) => {
        await axios.post(
            `${API_URL}/instructors/give_grade`,
            values
        );
        resetForm();
    };

    async function getData() {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        };
        if (panel === 1) {
            const res = await axios.get(
                `${API_URL}/instructors/get_courses`,
                config
            );
            const res_courses = res.data.courses;
            res_courses.forEach((course, i) => {
                course.id = i;
            });
            setCourses(res_courses);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (panel === 1) {
            getData();
        }
    }, [panel]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={panel} onChange={handleChange} centered>
                    <Tab label="Classrooms" {...a11yProps(0)} />
                    <Tab label="Courses" {...a11yProps(1)} />
                    <Tab label="Students" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={panel} index={0}>
                {classrooms ? (
                    <>
                        <Grid
                            container
                            justifyContent="flex-end"
                            sx={{ mb: 3 }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => setClassrooms(null)}
                            >
                                Clear
                            </Button>
                        </Grid>
                        <DataGrid
                            rows={classrooms}
                            columns={classroomColumns}
                            pageSize={25}
                            checkboxSelection={false}
                            disableSelectionOnClick
                            autoHeight
                        />
                    </>
                ) : (
                    <Formik
                        initialValues={{
                            slot: 1,
                        }}
                        validationSchema={GetClassroomsSchema}
                        onSubmit={getClassrooms}
                    >
                        {({ errors, touched, values, handleChange }) => (
                            <Form className={styles.form}>
                                <TextField
                                    name="slot"
                                    type="number"
                                    placeholder="Slot"
                                    label="Slot"
                                    value={values.slot}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.slot && touched.slot && (
                                    <div>{errors.slot}</div>
                                )}
                                <Button variant="contained" type="submit">
                                    View classrooms
                                </Button>
                            </Form>
                        )}
                    </Formik>
                )}
            </TabPanel>
            <TabPanel value={panel} index={1}>
                <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddCourse(true)}
                    >
                        Add a course
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddPrerequisite(true)}
                    >
                        Add Prerequisite
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenChangeName(true)}
                    >
                        Update name of a Course
                    </Button>
                </Grid>
                <DataGrid
                    rows={courses}
                    columns={courseColumns}
                    pageSize={25}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    autoHeight
                />
                <Dialog
                    open={openAddCourse}
                    onClose={() => setOpenAddCourse(false)}
                >
                    <DialogTitle>Add Course</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                course_id: "",
                                name: "",
                                credits: 3,
                                classroom_id: "",
                                slot: 1,
                                quota: 100,
                            }}
                            validationSchema={AddCourseSchema}
                            onSubmit={addCourse}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="course_id"
                                        type="text"
                                        placeholder="Course Id"
                                        label="Course Id"
                                        value={values.course_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.course_id && touched.course_id && (
                                        <div>{errors.course_id}</div>
                                    )}
                                    <TextField
                                        name="name"
                                        type="text"
                                        placeholder="Course Name"
                                        label="Course Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.name && touched.name && (
                                        <div>{errors.name}</div>
                                    )}
                                    <TextField
                                        name="credits"
                                        type="number"
                                        placeholder="Credits"
                                        label="Credits"
                                        value={values.credits}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.credits && touched.credits && (
                                        <div>{errors.credits}</div>
                                    )}
                                    <TextField
                                        name="classroom_id"
                                        type="text"
                                        placeholder="Classroom"
                                        label="Classroom"
                                        value={values.classroom_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.classroom_id &&
                                        touched.classroom_id && (
                                            <div>{errors.classroom_id}</div>
                                        )}
                                    <TextField
                                        name="slot"
                                        type="number"
                                        placeholder="Slot"
                                        label="Slot"
                                        value={values.slot}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.slot && touched.slot && (
                                        <div>{errors.slot}</div>
                                    )}
                                    <TextField
                                        name="quota"
                                        type="number"
                                        placeholder="Quota"
                                        label="Quota"
                                        value={values.quota}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.quota && touched.quota && (
                                        <div>{errors.quota}</div>
                                    )}
                                    <Button variant="contained" type="submit">
                                        Add course
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddCourse(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openAddPrerequisite}
                    onClose={() => setOpenAddPrerequisite(false)}
                >
                    <DialogTitle>Add Prerequisite of a Course</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                course_id: "",
                                prerequisite_course_id: "",
                            }}
                            validationSchema={AddPrerequisiteSchema}
                            onSubmit={addPrerequisite}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="course_id"
                                        type="text"
                                        placeholder="Course Id"
                                        label="Course Id"
                                        value={values.course_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.course_id && touched.course_id && (
                                        <div>{errors.course_id}</div>
                                    )}
                                    <TextField
                                        name="prerequisite_course_id"
                                        type="text"
                                        placeholder="Prerequisite Course Id"
                                        label="Prerequisite"
                                        value={values.prerequisite_course_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.prerequisite_course_id &&
                                        touched.prerequisite_course_id && (
                                            <div>
                                                {errors.prerequisite_course_id}
                                            </div>
                                        )}
                                    <Button variant="contained" type="submit">
                                        Add Prerequisite
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddPrerequisite(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openChangeName}
                    onClose={() => setOpenChangeName(false)}
                >
                    <DialogTitle>Update name of a Course</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                course_id: "",
                                name: "",
                            }}
                            validationSchema={ChangeNameSchema}
                            onSubmit={changeName}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="course_id"
                                        type="text"
                                        placeholder="Course Id"
                                        label="Course Id"
                                        value={values.course_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.course_id && touched.course_id && (
                                        <div>{errors.course_id}</div>
                                    )}
                                    <TextField
                                        name="name"
                                        type="text"
                                        placeholder="New Course name"
                                        label="New Course name"
                                        value={values.name}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.name && touched.name && (
                                        <div>{errors.name}</div>
                                    )}
                                    <Button variant="contained" type="submit">
                                        Update name
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenChangeName(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>
            <TabPanel value={panel} index={2}>
                {students ? (
                    <>
                        <Grid
                            container
                            justifyContent="flex-end"
                            sx={{ mb: 3 }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => setStudents(null)}
                            >
                                Clear
                            </Button>
                        </Grid>
                        <DataGrid
                            rows={students}
                            columns={studentColumns}
                            pageSize={25}
                            checkboxSelection={false}
                            disableSelectionOnClick
                            autoHeight
                        />
                    </>
                ) : (
                    <Formik
                        initialValues={{
                            course_id: "",
                        }}
                        validationSchema={GetStudentsSchema}
                        onSubmit={getStudents}
                    >
                        {({ errors, touched, values, handleChange }) => (
                            <Form className={styles.form}>
                                <TextField
                                    name="course_id"
                                    type="text"
                                    placeholder="Course ID"
                                    label="Course ID"
                                    value={values.course_id}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.course_id && touched.course_id && (
                                    <div>{errors.course_id}</div>
                                )}
                                <Button variant="contained" type="submit">
                                    View students
                                </Button>
                            </Form>
                        )}
                    </Formik>
                )}
                <Divider style={{ margin: "20px 0" }} />
                <Formik
                    initialValues={{
                        course_id: "",
                        student_id: "",
                        grade: 4,
                    }}
                    validationSchema={GiveGradeSchema}
                    onSubmit={giveGrade}
                >
                    {({ errors, touched, values, handleChange }) => (
                        <Form className={styles.form}>
                            <TextField
                                name="course_id"
                                type="text"
                                placeholder="Course ID"
                                label="Course ID"
                                value={values.course_id}
                                onChange={handleChange}
                                fullWidth
                            ></TextField>
                            {errors.course_id && touched.course_id && (
                                <div>{errors.course_id}</div>
                            )}
                            <TextField
                                name="student_id"
                                type="text"
                                placeholder="Student ID"
                                label="Student ID"
                                value={values.student_id}
                                onChange={handleChange}
                                fullWidth
                            ></TextField>
                            {errors.student_id && touched.student_id && (
                                <div>{errors.student_id}</div>
                            )}
                            <TextField
                                name="grade"
                                type="number"
                                placeholder="Grade"
                                label="Grade"
                                value={values.grade}
                                onChange={handleChange}
                                fullWidth
                            ></TextField>
                            {errors.grade && touched.grade && (
                                <div>{errors.grade}</div>
                            )}
                            <Button variant="contained" type="submit">
                                Give grade to student
                            </Button>
                        </Form>
                    )}
                </Formik>
            </TabPanel>
        </Box>
    );
}

Instructors.getLayout = function getLayout(page) {
    return <MainLayout>{page}</MainLayout>;
};

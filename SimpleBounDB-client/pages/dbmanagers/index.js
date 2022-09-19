import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { useRouter } from "next/router";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { API_URL } from "../../next.config";
import * as Yup from "yup";
import styles from "../../styles/dbmanagers/index.module.scss";
import TabPanel from "../../components/TabPanel/TabPanel";
import MainLayout from "../../layouts/main/MainLayout";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

export default function dbmanagers({ setLoading }) {
    const [panel, setPanel] = useState(1);
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [openAddInstructor, setOpenAddInstructor] = useState(false);
    const [openDeleteStudent, setOpenDeleteStudent] = useState(false);
    const [openUpdateInstructorTitle, setOpenUpdateInstructorTitle] =
        useState(false);
    const [openViewGrades, setOpenViewGrades] = useState(false);
    const [openViewCourses, setOpenViewCourses] = useState(false);

    const router = useRouter();

    const handleChange = (event, newValue) => {
        setPanel(newValue);
    };

    const sharedColumns = [
        { field: "id", hide: true },
        { field: "username", headerName: "Username", width: 170 },
        {
            field: "name",
            headerName: "Name",
            width: 150,
        },
        {
            field: "surname",
            headerName: "Surname",
            width: 150,
        },
        {
            field: "email",
            headerName: "Email",
            width: 250,
        },
        {
            field: "department_id",
            headerName: "Department",
            width: 150,
        },
    ];

    const instructorColumns = [
        ...sharedColumns,
        {
            field: "title",
            headerName: "Title",
            width: 250,
        },
    ];

    const studentColumns = [
        ...sharedColumns,
        {
            field: "completed_credits",
            headerName: "Completed Credits",
            width: 150,
        },
        {
            field: "gpa",
            headerName: "GPA",
            width: 80,
        },
    ];

    const courseColumns = [
        {
            field: "course_id",
            headerName: "Course ID",
            width: 150,
        },
        {
            field: "course_name",
            headerName: "Course Name",
            width: 300,
        },
        {
            field: "grade_average",
            headerName: "Grade Average",
            width: 130,
        },
    ];

    async function getData() {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        };
        if (panel === 0) {
            const res = await axios.get(
                `${API_URL}/dbmanagers/get_all_instructors`,
                config
            );
            const res_instructors = res.data.instructors;
            res_instructors.forEach((instructor, i) => {
                instructor.id = i;
            });
            setInstructors(res_instructors);
            setLoading(false);
        } else if (panel === 1) {
            const res = await axios.get(
                `${API_URL}/dbmanagers/get_all_students`,
                config
            );
            const res_students = res.data.students;
            res_students.forEach((student, i) => {
                student.id = i;
            });
            setStudents(res_students);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (panel !== 2) {
            getData();
        }
    }, [panel]);

    const sharedSchema = {
        username: Yup.string().required("Required"),
        password: Yup.string().required("No password provided"),
        name: Yup.string().required("No name provided"),
        surname: Yup.string().required("No surname provided"),
        email: Yup.string().email().required("No email provided"),
        department_id: Yup.string().required("No department_id provided"),
    };

    const StudentSchema = Yup.object().shape({
        ...sharedSchema,
        student_id: Yup.string().required("No student_id provided"),
    });

    const InstructorSchema = Yup.object().shape({
        ...sharedSchema,
        title: Yup.string().required("No title provided"),
    });

    const StudentDeleteSchema = Yup.object().shape({
        student_id: Yup.string().required("No student_id provided"),
    });

    const InstructorUpdateTitleSchema = Yup.object().shape({
        username: Yup.string().required("No username provided"),
        title: Yup.string().required("No title provided"),
    });

    const InstructorCoursesSchema = Yup.object().shape({
        username: Yup.string().required("No username provided"),
    });

    const ViewGradeSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
    });

    const addStudent = async (values, { resetForm }) => {
        setOpenAddStudent(false);
        try {
            await axios.post(`${API_URL}/dbmanagers/add_user`, values);
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const addInstructor = async (values, { resetForm }) => {
        setOpenAddInstructor(false);
        const value_title = {
            0: "Assistant Professor",
            1: "Associate Professor",
            2: "Professor",
        };
        try {
            await axios.post(`${API_URL}/dbmanagers/add_user`, {
                ...values, title: value_title[values.title]
            });
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const deleteStudent = async (values, { resetForm }) => {
        setOpenDeleteStudent(false);
        try {
            await axios.delete(
                `${API_URL}/dbmanagers/delete_student/${values.student_id}`
            );
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const viewGrades = async (values, { resetForm }) => {
        setOpenViewGrades(false);
        try {
            const res = await axios.get(
                `${API_URL}/dbmanagers/get_all_grades/${values.student_id}`
            );
            localStorage.setItem("grades", JSON.stringify(res.data.grades));
            router.push("/dbmanagers/student_grades");
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const viewCourses = async (values, { resetForm }) => {
        setOpenViewCourses(false);
        try {
            const res = await axios.get(
                `${API_URL}/dbmanagers/get_all_courses_instructor/${values.username}`
            );
            localStorage.setItem("courses", JSON.stringify(res.data.courses));
            router.push("/dbmanagers/instructor_courses");
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const viewGradeAverage = async (values, { resetForm }) => {
        const res = await axios.get(
            `${API_URL}/dbmanagers/get_course_average/${values.course_id}`
        );
        const res_grade_average = [res.data.grade_average];
        res_grade_average.forEach((grade_average, i) => {
            grade_average.id = i;
        });
        setCourses(res_grade_average);
        resetForm();
    };

    const changeTitle = async (values, { resetForm }) => {
        setOpenUpdateInstructorTitle(false);
        const value_title = {
            0: "Assistant Professor",
            1: "Associate Professor",
            2: "Professor",
        };
        try {
            await axios.post(`${API_URL}/dbmanagers/update_instructor_title`, {
                title: value_title[values.title],
                username: values.username,
            });
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={panel} onChange={handleChange} centered>
                    <Tab label="Instructors" {...a11yProps(0)} />
                    <Tab label="Students" {...a11yProps(1)} />
                    <Tab label="Courses" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={panel} index={0}>
                <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddInstructor(true)}
                    >
                        Add an instructor
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenUpdateInstructorTitle(true)}
                    >
                        Update instructor's title
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenViewCourses(true)}
                    >
                        View instructor's courses
                    </Button>
                </Grid>
                <DataGrid
                    rows={instructors}
                    columns={instructorColumns}
                    pageSize={25}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    autoHeight
                />
                <Dialog
                    open={openAddInstructor}
                    onClose={() => setOpenAddInstructor(false)}
                >
                    <DialogTitle>Add a new Instructor</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                username: "",
                                password: "",
                                name: "",
                                surname: "",
                                email: "",
                                department_id: "",
                                title: "",
                            }}
                            validationSchema={InstructorSchema}
                            onSubmit={addInstructor}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="username"
                                        type="text"
                                        placeholder="Username"
                                        value={values.username}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.username && touched.username && (
                                        <div>{errors.username}</div>
                                    )}
                                    <TextField
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        autoComplete="off"
                                        value={values.password}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.password && touched.password && (
                                        <div>{errors.password}</div>
                                    )}
                                    <TextField
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.email && touched.email && (
                                        <div>{errors.email}</div>
                                    )}
                                    <TextField
                                        name="name"
                                        type="text"
                                        placeholder="Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.name && touched.name && (
                                        <div>{errors.name}</div>
                                    )}
                                    <TextField
                                        name="surname"
                                        type="text"
                                        placeholder="Surname"
                                        value={values.surname}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.surname && touched.surname && (
                                        <div>{errors.surname}</div>
                                    )}
                                    <TextField
                                        name="department_id"
                                        type="text"
                                        placeholder="Department Id"
                                        value={values.department_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.department_id &&
                                        touched.department_id && (
                                            <div>{errors.department_id}</div>
                                        )}
                                    <Select
                                        value={values.title}
                                        name="title"
                                        onChange={handleChange}
                                        defaultValue={0}
                                        fullWidth
                                    >
                                        <MenuItem value={0}>
                                            Assistant Professor
                                        </MenuItem>
                                        <MenuItem value={1}>
                                            Associate Professor
                                        </MenuItem>
                                        <MenuItem value={2}>Professor</MenuItem>
                                    </Select>
                                    {errors.title && touched.title && (
                                        <div>{errors.title}</div>
                                    )}
                                    <Button variant="contained" type="submit">
                                        Add instructor
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddInstructor(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openUpdateInstructorTitle}
                    onClose={() => setOpenUpdateInstructorTitle(false)}
                >
                    <DialogTitle>Update instructor's title</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                username: "",
                                title: "",
                            }}
                            validationSchema={InstructorUpdateTitleSchema}
                            onSubmit={changeTitle}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="username"
                                        type="text"
                                        placeholder="Username"
                                        value={values.username}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.username && touched.username && (
                                        <div>{errors.username}</div>
                                    )}
                                    <Select
                                        value={values.title}
                                        name="title"
                                        onChange={handleChange}
                                        defaultValue={0}
                                        fullWidth
                                    >
                                        <MenuItem value={0}>
                                            Assistant Professor
                                        </MenuItem>
                                        <MenuItem value={1}>
                                            Associate Professor
                                        </MenuItem>
                                        <MenuItem value={2}>Professor</MenuItem>
                                    </Select>
                                    {errors.title && touched.title && (
                                        <div>{errors.title}</div>
                                    )}
                                    <Button variant="contained" type="submit">
                                        Update instructor's title
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenUpdateInstructorTitle(false)}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openViewCourses}
                    onClose={() => setOpenViewCourses(false)}
                >
                    <DialogTitle>View instructor's courses</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                username: "",
                            }}
                            validationSchema={InstructorCoursesSchema}
                            onSubmit={viewCourses}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="username"
                                        type="text"
                                        placeholder="Username"
                                        value={values.username}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.username && touched.username && (
                                        <div>{errors.username}</div>
                                    )}
                                    <Button variant="contained" type="submit">
                                        View instructor's courses
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenViewCourses(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>
            <TabPanel value={panel} index={1}>
                <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddStudent(true)}
                    >
                        Add a student
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenDeleteStudent(true)}
                    >
                        Delete a student
                    </Button>
                    <div class={styles.margin}></div>
                    <Button
                        variant="contained"
                        onClick={() => setOpenViewGrades(true)}
                    >
                        View grades of a student
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
                <Dialog
                    open={openAddStudent}
                    onClose={() => setOpenAddStudent(false)}
                >
                    <DialogTitle>Add a new Student</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                username: "",
                                password: "",
                                name: "",
                                surname: "",
                                email: "",
                                department_id: "",
                                student_id: "",
                            }}
                            validationSchema={StudentSchema}
                            onSubmit={addStudent}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="username"
                                        type="text"
                                        placeholder="Username"
                                        value={values.username}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.username && touched.username && (
                                        <div>{errors.username}</div>
                                    )}
                                    <TextField
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        autoComplete="off"
                                        value={values.password}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.password && touched.password && (
                                        <div>{errors.password}</div>
                                    )}
                                    <TextField
                                        name="email"
                                        type="email"
                                        placeholder="Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.email && touched.email && (
                                        <div>{errors.email}</div>
                                    )}
                                    <TextField
                                        name="name"
                                        type="text"
                                        placeholder="Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.name && touched.name && (
                                        <div>{errors.name}</div>
                                    )}
                                    <TextField
                                        name="surname"
                                        type="text"
                                        placeholder="Surname"
                                        value={values.surname}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.surname && touched.surname && (
                                        <div>{errors.surname}</div>
                                    )}
                                    <TextField
                                        name="department_id"
                                        type="text"
                                        placeholder="Department Id"
                                        value={values.department_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.department_id &&
                                        touched.department_id && (
                                            <div>{errors.department_id}</div>
                                        )}
                                    <TextField
                                        name="student_id"
                                        type="text"
                                        placeholder="Student Id"
                                        value={values.student_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.student_id &&
                                        touched.student_id && (
                                            <div>{errors.student_id}</div>
                                        )}
                                    <Button variant="contained" type="submit">
                                        Add student
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddStudent(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openDeleteStudent}
                    onClose={() => setOpenDeleteStudent(false)}
                >
                    <DialogTitle>Delete a Student</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                student_id: "",
                            }}
                            validationSchema={StudentDeleteSchema}
                            onSubmit={deleteStudent}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="student_id"
                                        type="text"
                                        placeholder="Student Id"
                                        value={values.student_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.student_id &&
                                        touched.student_id && (
                                            <div>{errors.student_id}</div>
                                        )}
                                    <Button variant="contained" type="submit">
                                        Delete student
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteStudent(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openViewGrades}
                    onClose={() => setOpenViewGrades(false)}
                >
                    <DialogTitle>View grades of a Student</DialogTitle>
                    <DialogContent>
                        <Formik
                            initialValues={{
                                student_id: "",
                            }}
                            validationSchema={StudentDeleteSchema}
                            onSubmit={viewGrades}
                        >
                            {({ errors, touched, values, handleChange }) => (
                                <Form className={styles.form}>
                                    <TextField
                                        name="student_id"
                                        type="text"
                                        placeholder="Student Id"
                                        value={values.student_id}
                                        onChange={handleChange}
                                        fullWidth
                                    ></TextField>
                                    {errors.student_id &&
                                        touched.student_id && (
                                            <div>{errors.student_id}</div>
                                        )}
                                    <Button variant="contained" type="submit">
                                        View grades
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenViewGrades(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>
            <TabPanel value={panel} index={2}>
                {courses ? (
                    <>
                        <Grid
                            container
                            justifyContent="flex-end"
                            sx={{ mb: 3 }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => setCourses(null)}
                            >
                                Clear
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
                    </>
                ) : (
                    <Formik
                        initialValues={{
                            course_id: "",
                        }}
                        validationSchema={ViewGradeSchema}
                        onSubmit={viewGradeAverage}
                    >
                        {({ errors, touched, values, handleChange }) => (
                            <Form className={styles.form}>
                                <TextField
                                    name="course_id"
                                    type="text"
                                    placeholder="Course ID"
                                    value={values.course_id}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.course_id && touched.course_id && (
                                    <div>{errors.course_id}</div>
                                )}
                                <Button variant="contained" type="submit">
                                    View grade average of a course
                                </Button>
                            </Form>
                        )}
                    </Formik>
                )}
            </TabPanel>
        </Box>
    );
}

dbmanagers.getLayout = function getLayout(page) {
    return <MainLayout>{page}</MainLayout>;
};

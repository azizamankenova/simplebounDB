import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputBase,
    Paper,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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

export default function Students({ setLoading }) {
    const [panel, setPanel] = useState(0);
    const [courses, setCourses] = useState([]);
    const [coursesTaken, setCoursesTaken] = useState([]);
    const [openAddCourse, setOpenAddCourse] = useState(false);
    const [openAddPrerequisite, setOpenAddPrerequisite] = useState(false);
    const [openChangeName, setOpenChangeName] = useState(false);
    const [students, setStudents] = useState(null);

    const handleChange = (event, newValue) => {
        setCourses(null)
        setPanel(newValue);
    };

    const courseColumns = [
        {
            field: "course_id",
            headerName: "Course ID",
            width: 100,
        },
        {
            field: "name",
            headerName: "Course Name",
            width: 250,
        },
        {
            field: "instructor_surname",
            headerName: "Instructor Surname",
            width: 170,
        },
        {
            field: "department_id",
            headerName: "Department",
            width: 120,
        },
        {
            field: "credits",
            headerName: "Credits",
            width: 70,
        },
        {
            field: "classroom_id",
            headerName: "Classroom",
            width: 100,
        },
        {
            field: "slot",
            headerName: "Time Slot",
            width: 100,
        },
        {
            field: "quota",
            headerName: "Quota",
            width: 70,
        },
        {
            field: "prerequisites",
            headerName: "Prerequisites",
            width: 300,
        },
    ];
    const coursesTakenColumns = [
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
            field: "grade",
            headerName: "Grade",
            width: 300,
        },
    ];

    const AddCourseSchema = Yup.object().shape({
        course_id: Yup.string().required("No course_id provided"),
    });

    const FilterCoursesSchema = Yup.object().shape({
        department_id: Yup.string().required("No department_id provided"),
        campus: Yup.string().required("No campus provided"),
        min_credits: Yup.number().integer().required("No min_credits provided"),
        max_credits: Yup.number().integer().required("No max_credits provided"),
    });

    const addCourse = async (values, { resetForm }) => {
        setOpenAddCourse(false);
        try {
            await axios.post(`${API_URL}/students/add_course`, values);
            getData();
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    const searchCourses = async (e) => {
        e.preventDefault();
        const key = e.target[0].value;
        if (key) {
            const res = await axios.get(
                `${API_URL}/students/search_courses/${key}`
            );
            const res_courses = res.data.courses;
            res_courses.forEach((course, i) => {
                course.id = i;
            });
            setCourses(res_courses);
        } else {
            getData();
        }
    };

    const filterCourses = async (values, { resetForm }) => {
        try {
            const res = await axios.post(
                `${API_URL}/students/filter_courses`,
                values
            );
            const res_courses = res.data.courses;
            res_courses.forEach((course, i) => {
                course.id = i;
            });
            setCourses(res_courses);
            resetForm();
        } catch (err) {
            console.log(err);
        }
    };

    async function getData() {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        };
        if (panel === 0) {
            const res = await axios.get(
                `${API_URL}/students/get_all_courses`,
                config
            );
            const res_courses = res.data.courses;
            res_courses.forEach((course, i) => {
                course.id = i;
            });
            setCourses(res_courses);
            setLoading(false);
        }
        if (panel === 1) {
            const res = await axios.get(
                `${API_URL}/students/get_courses`,
                config
            );
            const res_courses = res.data.all_courses_enrolled;
            res_courses.forEach((course, i) => {
                course.id = i;
            });
            setCoursesTaken(res_courses);
            setLoading(false);
        }
    }

    useEffect(() => {
        if (panel === 0 || panel === 1) {
            getData();
        }
    }, [panel]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={panel} onChange={handleChange} centered>
                    <Tab label="All Courses" {...a11yProps(0)} />
                    <Tab label="Taken Courses" {...a11yProps(1)} />
                    <Tab label="Filter Courses" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <TabPanel value={panel} index={0}>
                <Grid container justifyContent="space-between" sx={{ mb: 3 }}>
                    <Paper
                        component="form"
                        sx={{
                            p: "2px 4px",
                            display: "flex",
                            alignItems: "center",
                            width: 400,
                        }}
                        onSubmit={(e) => searchCourses(e)}
                    >
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search Course"
                        />
                        <IconButton
                            type="submit"
                            sx={{ p: "10px" }}
                            aria-label="search"
                        >
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                    <Button
                        variant="contained"
                        onClick={() => setOpenAddCourse(true)}
                    >
                        Add a course
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
            </TabPanel>
            <TabPanel value={panel} index={1}>
                <DataGrid
                    rows={coursesTaken}
                    columns={coursesTakenColumns}
                    pageSize={25}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    autoHeight
                />
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
                            department_id: "",
                            campus: "",
                            min_credits: 1,
                            max_credits: 1,
                        }}
                        validationSchema={FilterCoursesSchema}
                        onSubmit={filterCourses}
                    >
                        {({ errors, touched, values, handleChange }) => (
                            <Form className={styles.form}>
                                <TextField
                                    name="department_id"
                                    type="text"
                                    placeholder="Department Id"
                                    label="Department Id"
                                    value={values.department_id}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.department_id &&
                                    touched.department_id && (
                                        <div>{errors.department_id}</div>
                                    )}
                                <TextField
                                    name="campus"
                                    type="text"
                                    placeholder="Campus"
                                    label="Campus"
                                    value={values.campus}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.campus && touched.campus && (
                                    <div>{errors.campus}</div>
                                )}
                                <TextField
                                    name="min_credits"
                                    type="number"
                                    placeholder="Minimum Credits"
                                    label="Minimum Credits"
                                    value={values.min_credits}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.min_credits && touched.min_credits && (
                                    <div>{errors.min_credits}</div>
                                )}
                                <TextField
                                    name="max_credits"
                                    type="number"
                                    placeholder="Maximum Credits"
                                    label="Maximum Credits"
                                    value={values.max_credits}
                                    onChange={handleChange}
                                    fullWidth
                                ></TextField>
                                {errors.max_credits && touched.max_credits && (
                                    <div>{errors.max_credits}</div>
                                )}
                                <Button variant="contained" type="submit">
                                    Filter courses
                                </Button>
                            </Form>
                        )}
                    </Formik>
                )}
            </TabPanel>
        </Box>
    );
}

Students.getLayout = function getLayout(page) {
    return <MainLayout>{page}</MainLayout>;
};
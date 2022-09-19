import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button, Grid } from "@mui/material";

export default function instructor_courses() {
    const [courses, setCourses] = useState([]);

    const router = useRouter();

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
            field: "classroom_id",
            headerName: "Classroom",
            width: 140,
        },
        {
            field: "campus",
            headerName: "Campus",
            width: 180,
        },
        {
            field: "time_slot",
            headerName: "Slot",
            width: 80,
        },
    ];

    useEffect(() => {
        try {
            const saved_courses = JSON.parse(localStorage.getItem("courses"));
            saved_courses.forEach((course, index) => {
                course.id = index;
            });
            setCourses(saved_courses);
            localStorage.removeItem("courses");
        } catch (e) {
            router.push("/dbmanagers");
        }
    }, []);

    return (
        <div style={{ padding: "30px 40px" }}>
            <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => router.push("/dbmanagers")}
                >
                    Back
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
        </div>
    );
}

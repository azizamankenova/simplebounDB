import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import { Button, Grid } from "@mui/material";

export default function student_grades() {
    const [grades, setGrades] = useState([])

    const router = useRouter();

    const gradeColumns = [
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
            width: 80,
        },
    ];

    useEffect(() => {
        try {
            const saved_grades = JSON.parse(localStorage.getItem("grades"));
            saved_grades.forEach((grade, index) => {
                grade.id = index;
            });
            setGrades(saved_grades)
            localStorage.removeItem("grades")
        }
        catch (e) {
            router.push("/dbmanagers")
        }
    }, [])
    

    return (
        <div style={{padding: "30px 40px"}}>
            <Grid container justifyContent="flex-end" sx={{ mb: 3 }}>
                <Button
                    variant="contained"
                    onClick={() => router.push("/dbmanagers")}
                >
                    Back
                </Button>
            </Grid>
           <DataGrid
                rows={grades}
                columns={gradeColumns}
                pageSize={25}
                checkboxSelection={false}
                disableSelectionOnClick
                autoHeight
            /> 
        </div>
    );
}

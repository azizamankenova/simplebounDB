import {
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
} from "@mui/material";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import * as Yup from "yup";
import Button from "../../components/Button/Button";
import AuthLayout from "../../layouts/auth/AuthLayout";
import { API_URL } from "../../next.config";
import styles from "../../styles/user/form.module.scss";

export default function login() {
    const router = useRouter();

    const LoginSchema = Yup.object().shape({
        username: Yup.string().required("Required"),
        password: Yup.string().required("No password provided"),
        login_type: Yup.string().required("No login_type provided"),
    });

    const handleSubmit = async (values) => {
        const payload = { username: values.username, password: values.password };
        try {
            const response = (
                await axios.post(`${API_URL}/${values.login_type}/login`, payload)
            )?.data;

            localStorage.setItem("username", values.username);
            localStorage.setItem("access_token", response.access_token);

            router.push("/" + values.login_type);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <h1>Welcome Back!</h1>
            <Formik
                initialValues={{
                    username: "",
                    password: "",
                    login_type: "",
                }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, values, handleChange }) => (
                    <Form className={styles.form}>
                        <FormControl>
                            <RadioGroup
                                defaultValue="dbmanagers"
                                name="login_type"
                                value={values.login_type}
                                onChange={handleChange}
                            >
                                <FormControlLabel
                                    value="dbmanagers"
                                    control={<Radio />}
                                    label="Database Manager"
                                />
                                <FormControlLabel
                                    value="instructors"
                                    control={<Radio />}
                                    label="Instructor"
                                />
                                <FormControlLabel
                                    value="students"
                                    control={<Radio />}
                                    label="Student"
                                />
                            </RadioGroup>
                        </FormControl>
                        {errors.login_type && touched.login_type && (
                            <div className={styles.error}>
                                {errors.login_type}
                            </div>
                        )}
                        <Field
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Username"
                            className={styles.input}
                        ></Field>
                        {errors.username && touched.username && (
                            <div className={styles.error}>
                                {errors.username}
                            </div>
                        )}
                        <Field
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="off"
                            className={styles.input}
                        ></Field>
                        {errors.password && touched.password && (
                            <div className={styles.error}>
                                {errors.password}
                            </div>
                        )}
                        <Button type="submit">Log In</Button>
                    </Form>
                )}
            </Formik>
        </>
    );
}

login.getLayout = function getLayout(page) {
    return <AuthLayout>{page}</AuthLayout>;
};

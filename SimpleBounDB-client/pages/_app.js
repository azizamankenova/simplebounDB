import "../styles/globals.scss";
import "react-toastify/dist/ReactToastify.min.css";
import { toast, ToastContainer } from "react-toastify";
import NextNProgress from "nextjs-progressbar";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "../components/Loading/Loading";
import Head from "next/head";
import { createTheme, ThemeProvider } from "@mui/material";
import { useRouter } from "next/router";

const theme = createTheme({
    typography: {
        fontFamily: ['"Montserrat"'].join(","),
    },
});

function MyApp({ Component, pageProps }) {
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    // Use the layout defined at the page level, if available
    const getLayout = Component.getLayout || ((page) => page);

    useEffect(() => {
        // Add a request interceptor
        axios.interceptors.request.use(
            function (config) {
                // Do something before request is sent
                const token = localStorage.getItem("access_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                setLoading(true);
                return config;
            },
            function (error) {
                // Do something with request error
                if (error && error.message) {
                    toast.error(error.message);
                }
                setLoading(false);
                return Promise.reject(error);
            }
        );

        // Add a response interceptor
        axios.interceptors.response.use(
            function (response) {
                // Any status code that lie within the range of 2xx cause this function to trigger
                // Do something with response data
                if (response && response.data && response.data.message) {
                    toast.success(response.data.message);
                }
                setLoading(false);
                return response;
            },
            function (error) {
                // Any status codes that falls outside the range of 2xx cause this function to trigger
                // Do something with response error
                
                if (error && error.response && error.response.data) {
                    toast.error(
                        error.response.data.message ||
                            (typeof error.response.data === "string"
                                ? error.response.data
                                : JSON.stringify(error.response.data))
                    );
                }

                setTimeout(() => {
                    setLoading(false);
                }, 500);
                return Promise.reject(error);
            }
        );
    }, []);

    return (
        <>
            <ThemeProvider theme={theme}>
                <Head>
                    <title>SimpleBounDB</title>
                </Head>
                <NextNProgress color="#e1493f" height={2} />
                <Loading show={loading} />
                {getLayout(
                    <Component {...pageProps} setLoading={setLoading} />
                )}
                <ToastContainer position="bottom-right" />
                {loading && <style>{"body {overflow: hidden}"}</style>}
            </ThemeProvider>
        </>
    );
}

export default MyApp;

import LogoutIcon from '@mui/icons-material/Logout';
import { useRouter } from 'next/router';

function AuthLayout({ children }) {
    const router = useRouter();

    return (
        <>
            <div>{children}</div>
            <LogoutIcon style={{position: "fixed", bottom: "30px", right: "30px", cursor: "pointer"}} onClick={() => router.push("/user/login")}/>
        </>
    );
}

export default AuthLayout;

import {useAuth} from "../../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";


export default function ProtectedRoute({children}){
    const {user} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!user){
            navigate("/login");
        }
    }, [user, navigate]);

    return user? children : null
}
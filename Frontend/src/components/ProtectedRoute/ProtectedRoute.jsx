import {useAuth} from "../../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";


export default function ProtectedRoute({children}){
    const {user, isLoading} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!user && !isLoading){
            navigate("/login");
        }
    }, [user, isLoading, navigate]);

    if(isLoading || !user){
        return <div>Loading...</div>;
    }

    return children;
}
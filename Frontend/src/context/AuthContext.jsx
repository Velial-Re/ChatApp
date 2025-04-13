import {createContext, useContext, useEffect, useState} from "react";
import api from "../api/api.js";


const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get("auth/user");
            setUser(response.data)
        } catch (error) {
            setUser(null);
            throw new Error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);


    const login = async (userData) => {
        try {
            const response = await api.post("auth/login", {
                username: userData.username,
                password: userData.password
            });

            setUser({username: response.data.Username});
            return response.data;

        } catch (error) {
            logout();
            console.error("Login failed", error);

            let errorMessage = 'Login failed';
            if(error.response){
                errorMessage = error.response.data?.message || errorMessage;
            }
            throw new Error(errorMessage);
        }
    }

    const logout = async () => {
        try {
            await api.post("auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
        }
    }

    const refreshAuth = async () => {
        try {
            await api.post("auth/refresh");
        } catch (error) {
            console.error("Refresh token failed", error);
            logout();
            return null;
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }


    return (
        <AuthContext.Provider value={{user, login, logout, isLoading, refreshAuth}}>
            <div className="App">
                {children}
            </div>
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
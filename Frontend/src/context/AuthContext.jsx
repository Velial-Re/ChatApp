import {createContext, useContext, useEffect, useState} from "react";


const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const username = localStorage.getItem("username");
        if (token && refreshToken && username) {
            setUser({
                username,
                token,
                refreshToken
            });
        }
        setIsLoading(false);
    }, []);

    const refreshAuth = async () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            logout();
            return null;
        }

        try {
            const response = await fetch("http://localhost:8080/api/auth/refresh", {
                method: "Post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${refreshToken}`
                }
            });
            if(!response.ok){
                logout();
                return null;
            }
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                localStorage.setItem("refreshToken", data.refreshToken);
                setUser({
                    username: localStorage.getItem("username"),
                    token: data.token,
                    refreshToken: data.refreshToken
                });
                return data.token;
            }
        }catch (error){
            console.error("Refresh token failed", error);
            logout();
        }
        return null;
    }

    const login = async (userData) => {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("refreshToken", userData.refreshToken);
        localStorage.setItem("username", userData.username);
        setUser(userData);
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        setUser(null);
    }

    const refreshToken = async () => {
        try{
            const refreshToken = localStorage.getItem("refreshToken");
            if(!refreshToken) return null;

            const response = await fetch("http://localhost:8080/api/auth/refresh",{
                method: "Post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${refreshToken}`
                }
            });
            if(response.ok){
                const data = await response.json();
                localStorage.setItem("token", data.token);
                return data.token;
            }
            return null;
        }catch (error){
            console.error("Refresh token failed:", error);
            return null;
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <AuthContext.Provider value={{user, login, logout, isLoading, refreshAuth, refreshToken}}>
            <div className="App">
                {children}
            </div>
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext);
}
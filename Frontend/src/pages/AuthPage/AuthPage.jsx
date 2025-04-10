import {Route, Routes, useNavigate} from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm/LoginForm.jsx";
import {RegistrationForm} from "../../components/auth/RegistrationForm/RegistrationForm.jsx";
import {useState} from "react";


export default function AuthPage() {
    const [activeTab, setActiveTab] = useState("login");
    const navigate = useNavigate();

    const tabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/auth/${tab}`);
    };

    return (
        <div className="auth__container">
            <div className="auth__tabs">
                <button
                    className={`auth__tab auth__tab--login ${activeTab === "login" ? "auth__tab--active" : ""}`}
                    onClick={() => tabChange("login")}
                >
                    Вход
                </button>
                <button
                    className={`auth__tab auth__tab--registration ${activeTab === "registration" ? "auth__tab--active" : ""}`}
                    onClick={() => tabChange("registration")}
                >
                    Регистрация
                </button>
                <span className="auth__tabs-indicator" data-active-tab={activeTab}></span>
            </div>
            <div className="auth__form-container">
                <Routes>
                    <Route path="login" element={<LoginForm/>}/>
                    <Route path="registration" element={<RegistrationForm/>}/>
                </Routes>
            </div>
        </div>
    )
}
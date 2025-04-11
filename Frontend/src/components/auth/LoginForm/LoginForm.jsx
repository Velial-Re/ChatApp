import React, {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import {useAuth} from "../../../context/AuthContext.jsx";
import {useChat} from "../../../context/ChatContext.jsx";

export default function LoginForm(){
    const { user, login } = useAuth();
    const { joinChat } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        if(user){
            navigate("/");
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e) => {
        const {name, value} = e.target;
        setFormData(val => ({
            ...val,
            [name]: value
        }));
        // Очистка ошибок при изменении поля
        if (errors[name]) {
            setErrors(er => ({
                ...er,
                [name]: ""
            }))
        }
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.username?.trim()) {
            newErrors.username = "Имя пользователя обязательно";
        }
        if (!formData.password) {
            newErrors.password = "Пароль обязательно";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onLogin = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
                credentials: "include",
                mode: "cors"
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message|| "Ошибка авторизации");
            }

            const data = await response.json();

            // Сохранение данных
            localStorage.setItem("token", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("username", formData.username);
            // Логин из контекста
            login({
                username: formData.username,
                token: data.token,
                refreshToken: data.refreshToken
            });
            try {
            await joinChat(formData.username, "general", true);
            }catch (chatError){
                console.error("Ошибка подключения к чату: ", chatError);
            }

            navigate("/");
        } catch (error) {
            setErrors({form: error.message || "Ошибка авторизации"});
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login__container">
            <h2 className="login__title">Войти</h2>
            {errors.form && <div className="error-message form__error">{errors.form}</div>}
            <form className="login__form" onSubmit={onLogin}>
                <div className="form__group">
                    <label className="form__label">Имя пользователя</label>
                    <input
                        className={`form__input ${errors.username ? "input-error" : ""}`}
                        type="text"
                        value={formData.username}
                        name="username"
                        onChange={onChange}
                        placeholder="Введите ваше имя"
                        disabled={isLoading}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
                <div className="form__group">
                    <label className="form__label">Пароль</label>
                    <input
                        className={`form__input ${errors.password ? "input-error" : ""}`}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="Введите ваш пароль"
                        disabled={isLoading}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                <button
                    type="submit"
                    className="form__button"
                    disabled={isLoading}
                >
                    {isLoading ? "Вход..." : "Войти"}
                </button>
            </form>
        </div>
    )
}
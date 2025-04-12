import React, {useState} from "react";
import api from "../../../api/api.js";

export const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const onChange = (e) => {
        const {name, value} = e.target;
        setFormData(val => ({
            ...val,
            [name]: value
        }))
    };

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.username?.trim()) {
            newErrors.username = "Имя пользователя обязательно";
        } else if (formData.username?.length < 4) {
            newErrors.username = "Имя пользователя должно быть не менее 4 символов";
        }
        if (!formData.email) {
            newErrors.email = "Email обязательно";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Некорректный email';
        }
        if (!formData.password) {
            newErrors.password = "Пароль обязательно";
        } else if (formData.password.length < 8) {
            newErrors.password = "Пароль должен быть не менее 8 символов";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Пароли не совпадают";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitted(true);

        try {
            const response = await api.post("/auth/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            alert('Регистрация успешна!');

        } catch (error) {
            console.error('Registration error:', error);
            if (error.response?.data?.message) {
                alert(`Ошибка регистрации: ${error.response.data.message}`);
            } else {
                alert('Произошла ошибка при регистрации');
            }
        } finally {
            setIsSubmitted(false);
        }
    };

    return (
        <div className="registration__container">
            <h2 className="registration__title">Регистрация</h2>
            <form className="registration__form" onSubmit={onSubmit}>
                <div className="form__group">
                    <label className="form__label">Имя пользователя</label>
                    <input
                        className={`form__input ${errors.username ? "input-error" : ""}`}
                        type="text"
                        value={formData.username}
                        name="username"
                        onChange={onChange}
                        placeholder="Введите ваше имя"/>
                    {errors.username && <span className="error-message">{errors.username}</span>}
                </div>
                <div className="form__group">
                    <label className="form__label">Email</label>
                    <input
                        className={`form__input ${errors.email ? "input-error" : ""}`}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="Введите ваш email"/>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                <div className="form__group">
                    <label className="form__label">Пароль</label>
                    <input
                        className={`form__input ${errors.password ? "input-error" : ""}`}
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        type="password"
                        placeholder="Введите ваш пароль"
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                <div className="form__group">
                    <label className="form__label">Повторите пароль</label>
                    <input
                        className={`form__input ${errors.confirmPassword ? "input-error" : ""}`}
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        placeholder="Повторите ваш пароль"/>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
                <button
                    type="submit"
                    className="form__button"
                    disabled={isSubmitted}
                    onClick={onSubmit}>{isSubmitted ? "Регистрация..." : "Зарегистрироваться"}</button>
            </form>
        </div>
    );
};
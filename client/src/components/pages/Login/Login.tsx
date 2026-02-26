import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { AuthResponse, OutletContextType } from "../../../types";
import { $api, setAccessToken } from "../../../utils/axios.instance";


const Login: React.FC = () => {
    const { setUser } = useOutletContext<OutletContextType>()
    const navigate = useNavigate()

    const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string
        }

        $api.post<AuthResponse>('/users/login', data)
         .then((res) => {
            console.log('Login successful:', res.data);
            setAccessToken(res.data.accessToken)
            setUser(res.data.user)
            navigate('/main')
         })
         .catch(err => {
            console.log('Ошибка входа: ', err.response?.data || err.message);
            alert('Ошибка входа. Проверьте email и пароль.')
         })
    }

    return (
        <>
            <h2>Вход в систему</h2>
            <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: '1rem' }}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required style={{ width: '100%', padding: '0.5rem' }}/>
                </div>
                <div>
                    <label htmlFor="password">Пароль</label>
                    <input type="password" id="password" name="password" required style={{ width: '100%', padding: '0.5rem' }}/>
                </div>
                <button type="submit">Войти</button>
            </form>
        </>
    )
}

export default Login

import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { AuthResponse, OutletContextType } from "../../../types";
import { $api, setAccessToken } from "../../../utils/axios.instance";


const Registration: React.FC = () => {
    const { setUser } = useOutletContext<OutletContextType>()
    const navigate = useNavigate()

    const submitHandler = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const data = {
            username: formData.get('login') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string
        }

        $api.post<AuthResponse>('/users/registration', data)
         .then((res) => {
            console.log('Response:', res.data);
            setAccessToken(res.data.accessToken)
            setUser(res.data.user)
            navigate('/main')
         })
         .catch(err => {
            console.log('Что-то пошло не так: ', err.response.data || err.message);
            alert('Ошибка регистрации')
         })
    }
 
    return (
        <>
            <h2>Registration</h2>
            <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="login">Login</label>
                <input type="text" id="login" name="login" required/>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required/>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required/>
                <button type="submit" value='Register'> Регистрация</button>
            </form>
        </>
    )
}

export default Registration
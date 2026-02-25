import type React from "react";
import type { User } from "../../types";
import { NavLink, useNavigate } from "react-router-dom";



interface NavbarProps {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction <User | null>>
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
    const navigate = useNavigate()

    const logoutHandler = () : void => {
        $api('/users/logout')
         .then((res) => {
            if (res.status === 200) {
                setUser(null)
                navigate('/login')
            }
         })
         .catch((err) => console.error(err))
    }

    return (
        <nav className="navbar">
            {
                user ? (
                    <>
                        <NavLink to='/main'>Главная</NavLink>
                        <button onClick={logoutHandler}>Выход</button>
                    </>
                ) : (
                    <>
                    <NavLink to='/home'>Домашняя</NavLink>
                    <NavLink to='/registration'>Регистрация</NavLink>
                    <NavLink to='/login'>Войти</NavLink>
                    </>
                )
            }
        </nav>
    )
}

export default Navbar
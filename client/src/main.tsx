import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/pages/Home/Home.tsx";
import Registration from "./components/pages/Registration/Registration.tsx";
import Login from "./components/pages/Login/Login.tsx";
import Main from "./components/pages/Main/Main.tsx";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute.tsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/home',
        element: <Home/>
      },
      {
        path:'/registration',
        element: <Registration/>,
      },
      {
        path:'/login',
        element: <Login/>,
      },
      {
        path:'/main',
        element: 
        <ProtectedRoute>
          <Main/>,
        </ProtectedRoute>
      },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

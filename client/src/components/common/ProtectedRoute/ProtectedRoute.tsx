import type React from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import type { OutletContextType } from "../../../types";

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user } = useOutletContext<OutletContextType>()
    if (user) {
        return <>{children}</>
    } else {
        return <Navigate to='/login' replace/>
    }
}

export default ProtectedRoute
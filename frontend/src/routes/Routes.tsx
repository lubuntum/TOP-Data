import { Navigate, Outlet, replace } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

export const ProtectedRoute = () => {
    const {user, isAdmin} = useAuth()
    if (user) return <Outlet/>
    if (isAdmin) return <Navigate to={"/admin/panel"} replace />
    return <Navigate to={"/login"} />
}
export const PublicRoute = () => {
    const {user, isAdmin} = useAuth()
    if (user) return <Navigate to={"/profile"} replace />
    if (isAdmin) return <Navigate to={"/admin/panel"} replace />
    return <Outlet />
}
export const AdminRoute = () => {
    const {user, isAdmin} = useAuth()

    if (isAdmin) return <Outlet />
    if (user) return <Navigate to={"/profile"} replace />

    return <Navigate to={"/admin/login"} replace />
    
}
export const AdminPublicRoute = () => {
    const {user, isAdmin} = useAuth()
    if (isAdmin) return <Navigate to={"/admin/panel"} replace />
    if (user) return <Navigate to="/profile" replace />
    return <Outlet />
}
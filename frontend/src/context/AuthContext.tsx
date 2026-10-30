import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../api/client";

interface UserProfile {
  id: number;
  parent_full_name: string;
  child_full_name: string;
  school_number: string;
  class_number: number;
  class_label: string;
  login: string;
}

interface AuthContextType {
    user: UserProfile | null
    loading: boolean
    checkAuth: () => Promise<void>
    logout: () => Promise<void>
    setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const checkAuth = async () => {
        try{
            const res = await apiClient.get("/auth/me")
            setUser(res.data)
        } catch(err) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    useEffect(()=>{
        checkAuth()
    },[])
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout')
        } finally {
            setUser(null)
        }
    }
    return (<AuthContext.Provider value={{user, loading, checkAuth, logout, setUser}}>
        {!loading && children}
    </AuthContext.Provider>)
}
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
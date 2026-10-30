import {z} from "zod"
import {useState} from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiClient } from "../../api/client"
import { useAuth } from "../../context/AuthContext"
const loginSchema = z.object({
    login: z.string().min(1, "Введите логин"),
    password: z.string().min(1, "Введите пароль")
})
type FormData = z.infer<typeof loginSchema>

export const LoginForm = () => {
    const [error, setError] = useState<string | null>(null)
    const {checkAuth} = useAuth()
    const navigate = useNavigate()
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<FormData>({resolver: zodResolver(loginSchema)})
    const onSubmit = async (data: FormData) => {
        setError(null)
        try{
            await apiClient.post('/auth/login', data)
            await checkAuth()
            navigate('/profile')
        } catch(err: any) {
            setError(err.response?.data?.detail || 'Неверный логин или пароль')
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <h2 className="text-2xl font-bold text-center mb-6">Вход в систему</h2>
            {error && <div className="text-danger bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</div>}
            <div className="form-group">
                <label className="text-sm font-medium mb-1">Логин</label>
                <input {...register('login')} className="form-input" placeholder="Иван_12345" />
                {errors.login && <span className="form-error">{errors.login.message}</span>}
            </div>
            <div className="form-group">
                <label className="text-sm font-medium mb-1">Пароль</label>
                <input type="password" {...register('password')} className="form-input" />
                {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 mb-4">
                {isSubmitting ? "Вход..." : "Войти"}
            </button>
            <div className="text-center text-sm">
                Нет аккаунта? <Link to="/register" className="text-primary font-medium hover:underline">Зарегистрироваться</Link>
            </div>
        </form>
    )
}
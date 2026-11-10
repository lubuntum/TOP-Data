import { useState, type ChangeEvent } from "react"
import { formatPhone } from "../../utility/formatPhone"
import {z} from 'zod'
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiClient } from "../../api/client"

const resetSchema = z.object({
    phone: z.string()
        .transform(val => val.replace(/\D/g, ''))
        .refine(val => val.length === 11 && (val.startsWith('7') || val.startsWith('8')), {
            message: "Введите полный номер телефона"})
        .transform(val => {
            const normalized = val.startsWith('8') ? '7' + val.slice(1) : val
            return '+' + normalized
        })
})
type FormData = z.infer<typeof resetSchema>
export const ResetPasswordForm = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [result, setResult] = useState<{login: string; password: string} | null>(null)

    const {register, handleSubmit, control, formState: {errors}} = useForm<FormData>({
        resolver: zodResolver(resetSchema),
        mode: "onTouched"
    })
    const copyToBuffer = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            alert("Данные успешно скопированы!")
        } catch(err) {
            console.error(err)
        }
    }
    const onSubmit = async (data: FormData) => {
        setError(null)
        setIsSubmitting(true)
        try {
            const response = await apiClient.post('/auth/reset-password', data)
            setResult(response.data)
        } catch(err: any) {
            if (err.response && err.response.data.detail)
                setError(err.response.data.detail)
            else setError("Ошибка при отправке запроса")
        } finally {
            setIsSubmitting(false)
        }
    }
    if (result) return (<>
        <div className="register-form text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Данные восстановлены</h2>
            <p className="text-sm text-muted mb-4">Мы сгенерировали для вас новый пароль. Сохраните его.</p>
            <div className="bg-surface border rounded-md p-4 mb-6 text-left">
                <p className="mb-2"><strong>Логин:</strong>{result.login}</p>
                <p><strong>Новый пароль:</strong>{result.password}</p>
            </div>
            <button 
                className="btn-primary mb-4"
                onClick={() => copyToBuffer(`Логин: ${result?.login}, Пароль: ${result?.password}`)}>
                Скопировать данные
            </button>
            <div className="text-center text-sm">
                <a href="/login" className="text-primary hover:underline">Перейти на страницу входа</a>
            </div>
        </div>
    </>)
    return (<>
        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <h2 className="text-2xl font-bold text-center mb-6">Сброс пароля</h2>
            <p className="text-sm text-muted text-center mb-6">Введите номер телефона родителя, указанный при регистрации. Мы восстановим ваш доступ.</p>
            
            {error && <div className="text-danger bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</div>}
            
            <div className="form-group">
                <label className="text-sm font-medium mb-1">Номер телефона родителя</label>
                <Controller
                    name="phone"
                    control={control}
                    defaultValue=""
                    render = {({field}) => (
                        <input 
                            {...field}
                            onChange={e => field.onChange(formatPhone(e.target.value))}
                            placeholder="+7 (___) ___-__-__"
                            className="form-input"
                            maxLength={18}
                        />
                    )}
                />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-4"
                
            >{isSubmitting ? "Поиск..." : "Восстановить данные"}</button>
        </form>
    </>)
}
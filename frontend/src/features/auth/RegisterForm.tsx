import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';
import type { RegisterRequest, RegisterResponse } from './types';
import { da } from 'zod/locales';
import './RegisterForm.css'
import { formatPhone } from '../../utility/formatPhone';
const registerSchema = z.object({
    parent_full_name: z.string().min(2, "Введите ФИО родителя"),
    child_full_name: z.string().min(2, "Введите ФИО ребенка"),
     school_number: z.string()
        .min(1, "Номер школы")
        .regex(/^\d+$/, "Только цифры"),
    class_number: z.coerce.number().min(1, "Класс от 1 до 11").max(11, "Класс от 1 до 11"),
    class_label: z.string()
        .length(1, "Введите букву класса")
        .transform(val => val.toUpperCase())
        .refine(val => /^[а-яА-ЯёЁ]$/.test(val), { message: "Разрешены только русские буквы" }),
    phone: z.string()
        .refine((val) => {
        // Извлекаем только цифры из того, что видит пользователь: +7 (343) 233-23-22 -> 73432332322
            const digits = val.replace(/\D/g, '');
            return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
        }, {
            message: "Введите полный номер телефона",
        })
        .transform((val) => {
            // Очищаем и приводим к формату +7XXXXXXXXXX для бэкенда
            let digits = val.replace(/\D/g, '');
            if (digits.startsWith('8')) digits = '7' + digits.slice(1);
            return '+' + digits;
        }),
    consent_pd: z.literal(true, { error: () => ({ message: "Необходимо согласие" }) }),
    consent_testing: z.literal(true, { error: () => ({ message: "Необходимо согласие" }) }),
})

type FormData = z.infer<typeof registerSchema>

export const RegisterForm = () => {
    const [result, setResult] = useState<RegisterResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const {register, handleSubmit, control, formState: {errors, isSubmitting}} = 
        useForm<
            z.input<typeof registerSchema>, 
            unknown, 
            z.output<typeof registerSchema>>({
        resolver: zodResolver(registerSchema)
    })
    const onSubmit = async (data: FormData) => {
        setError(null)
        try {
            const response = await apiClient.post<RegisterResponse>('/auth/register', data)
            setResult(response.data)
        } catch(error: any) {
            if (error.response && error.response.data.detail)
                setError(error.response.data.detail)
            else 
                setError('Ошибка соединения с сервером')
      
        }
    }
    if (result) {
        return (
            <div className="register-form text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Успешно!</h2>
            <p className="text-sm text-muted mb-4">Сохраните данные для входа.</p>
            
            <div className="bg-surface border rounded-md p-4 mb-6 text-left">
                <p className="mb-2"><strong>Логин:</strong> {result.login}</p>
                <p><strong>Пароль:</strong> {result.password}</p>
            </div>
            
            <button 
                onClick={() => navigator.clipboard.writeText(`Логин: ${result.login}, Пароль: ${result.password}`)}
                className="btn-primary"
            >
                Скопировать данные
            </button>
            </div>
        );
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
      <h2 className="text-2xl font-bold text-center mb-6">Регистрация</h2>
      
      {error && <div className="text-danger bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</div>}

      <div className="form-group">
        <label className="text-sm font-medium mb-1">ФИО родителя</label>
        <input {...register('parent_full_name')} className="form-input" placeholder='Иванов Иван Иванович' />
        {errors.parent_full_name && <span className="form-error">{errors.parent_full_name.message}</span>}
      </div>

      <div className="form-group">
        <label className="text-sm font-medium mb-1">ФИО ребенка</label>
        <input {...register('child_full_name')} className="form-input" placeholder='Иванов Иван Иванович' />
        {errors.child_full_name && <span className="form-error">{errors.child_full_name.message}</span>}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 form-group mb-0">
          <label className="text-sm font-medium mb-1">Школа</label>
          <input {...register('school_number')} className="form-input"  onInput={e => e.currentTarget.value = e.currentTarget.value.replace(/D\g/, '')} />
          {errors.school_number && <span className="form-error">{errors.school_number.message}</span>}
        </div>
        <div className="w-24 form-group mb-0">
          <label className="text-sm font-medium mb-1">Класс</label>
          <input type="number" {...register('class_number')} className="form-input" placeholder='1-11' />
        </div>
        <div className="w-20 form-group mb-0">
          <label className="text-sm font-medium mb-1">Буква</label>
          <input {...register('class_label')} maxLength={1} className="form-input" placeholder='а-я' />
        </div>
      </div>

      <div className="form-group">
        <label className="text-sm font-medium mb-1">Телефон родителя</label>
        <Controller
          name="phone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <input
              {...field}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              placeholder="+7 (___) ___-__-__"
              className="form-input"
              maxLength={18} // +7 (999) 999-99-99 = 18 символов
            />
          )}
        />
        {errors.phone && <span className="form-error">{errors.phone.message}</span>}
      </div>

      <div className="checkbox-group">
        <input type="checkbox" {...register('consent_pd')} id="consent_pd" />
        <label htmlFor="consent_pd" className="text-sm text-muted">Согласие на обработку персональных данных</label>
      </div>
      {errors.consent_pd && <span className="form-error mb-4 block">{errors.consent_pd.message}</span>}

      <div className="checkbox-group">
        <input type="checkbox" {...register('consent_testing')} id="consent_testing" />
        <label htmlFor="consent_testing" className="text-sm text-muted">Согласие на прохождение тестирования</label>
      </div>
      {errors.consent_testing && <span className="form-error mb-4 block">{errors.consent_testing.message}</span>}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-2">
        {isSubmitting ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );

}

import { useState, type ChangeEvent } from "react"
import { apiClient } from "../../api/client"
import type { UserExport } from "./types"
import { exportToExcel } from "../../utility/exportToExcel"
export const AdminPanel = () => {
    const [data, setData] = useState([])
    const [filters, setFilters] = useState({
        date_from:'',
        date_to: '',
        city: '',
        school: '',
        class_num: ''
    })
    const changeData = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFilters(prev => ({...prev, [name]: value}))
    }
    const fetchData = async () => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value)
        })
        const res = await apiClient.get(`/admin/export-users?${params.toString()}`)
        
        setData(res.data)
    }
    const downloadXLSX = () => {
        if (data.length === 0) {
            alert("Нет данных для экспорта, пожалуйста используйте фильтры и нажмите поиск.")
            return
        }
        exportToExcel(data, `результаты_${new Date().toISOString().slice(0, 10)}.xlsx`)
    }
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            <h1 className="text-xl md:text-2xl font-bold mb-6">Панель администратора</h1>
            <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
                <input 
                    type="date" 
                    className="border p-2 rounded-md text-sm"
                    name="date_from"
                    onChange={e => changeData(e)} />
                <input 
                    type="date" 
                    className="border p-2 rounded-md text-sm"
                    name="date_to"
                    onChange={e => changeData(e)} />
                <input
                    placeholder="Город"
                    className="border p-2 rounded-md text-sm flex-1 min-w-[120px]"
                    name="city"
                    onChange={(e) => changeData(e)}
                />
                <input 
                    placeholder="Школа" 
                    className="border p-2 rounded-md text-sm flex-1 min-w-[100px]"
                    name="school"
                    onChange={e => changeData(e)}/>
                <input 
                    placeholder="Номер класса"
                    className="border p-2 rounded-md text-sm flex-1 min-w-[80px]"
                    name="class_num"
                    onChange={e => changeData(e)} />              
                <button
                    onClick={fetchData}
                    className="btn-primary px-6"
                >Поиск</button>
                <button
                    onClick={downloadXLSX}
                    className="btn-primary px-6"
                >Скачать XLSX</button>

            </div>
            <div className="scroll-x shadow-sm">
                <table className="w-full min-w-[900px] text-sm">
                    <thead>
                        <tr style={{backgroundColor: "var(--color-bg)"}}>
                            <th className="p-2 border">Родитель</th>
                            <th className="p-2 border">Телефон</th>
                            <th className="p-2 border">Дата</th>
                            <th className="p-2 border">Город</th>
                            <th className="p-2 border">Школа/класс</th>
                            <th className="p-2 border">Ребенок</th>
                            <th className="p-2 border">Климов</th>
                            <th className="p-2 border">Голланд</th>
                            <th className="p-2 border">Йовайши</th>
                            <th className="p-2 border">Интересы</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data && data.length > 0) && data.map((user: UserExport, i) => (
                            <tr key={i} style={{background: i % 2 === 0 ? "white" : "var(--color-bg)"}}>
                                <td className="p-2 border">{user.parent_full_name}</td>
                                <td className="p-2 border">{user.phone}</td>
                                <td className="p-2 border">{user.created_at}</td>
                                <td className="p-2 border">{user.city}</td>
                                <td className="p-2 border">{user.school_number} - {user.class_number}/{user.class_label}</td>
                                <td className="p-2 border">{user.child_full_name}</td>
                                <td className="p-2 border text-center font-bold" style={{backgroundColor: user.tests['klimov'] ? "var(--color-secondary)" : "var(--color-danger)"}}>{user.tests['klimov'] ? '+' : "-"}</td>
                                <td className="p-2 border text-center font-bold" style={{backgroundColor: user.tests['holland'] ? "var(--color-secondary)" : "var(--color-danger)"}}>{user.tests['holland'] ? '+' : "-"}</td>
                                <td className="p-2 border text-center font-bold" style={{backgroundColor: user.tests['yovaishi'] ? "var(--color-secondary)" : "var(--color-danger)"}}>{user.tests['yovaishi'] ? '+' : "-"}</td>
                                <td className="p-2 border text-center font-bold" style={{backgroundColor: user.tests['interests'] ? "var(--color-secondary)" : "var(--color-danger)"}}>{user.tests['interests'] ? '+' : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
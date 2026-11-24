import type { UserExport } from "../features/admin/types"
import * as XLSX from 'xlsx'
const EXCEL_HEADERS = [
    {key: 'parent_full_name', label: "ФИО родителя"},
    {key: 'phone', label: 'Телефон'},
    {key: 'created_at', label: 'Дата регистрации'},
    {key: 'city', label: 'Город'},
    {key: 'school_number', label: 'Школа'},
    {key: 'class', label: "Класс"},
    {key: 'child_full_name', label: 'ФИО ребенка'},
    {key: 'klimov', label: 'Климов'},
    {key: 'holland', label: 'Голланд'},
    {key: 'yovaishi', label: 'Йовайши'},
    {key: 'interests', label: 'Интересы'},
]

export const exportToExcel = (data: UserExport[], fileName: string = 'users_export.xlsx') => {
    //1. Parse data to simple format
    const formatedData = data.map(user => ({
        parent_full_name: user.parent_full_name,
        phone: user.phone,
        created_at: user.created_at,
        city: user.city || '-',
        school_number: user.school_number, 
        class: `${user.class_number}${user.class_label}`,
        child_full_name: user.child_full_name,
        klimov: JSON.stringify(user.tests['klimov']),
        holland: JSON.stringify(user.tests['holland']),
        yovaishi: JSON.stringify(user.tests['yovaishi']),
        interests: JSON.stringify(user.tests['interests'])
    }))
    //2. Creating sheet with named headers as required
    const worksheet = XLSX.utils.json_to_sheet(formatedData, {
        header: EXCEL_HEADERS.map(h => h.key)
    })
    //3. Change cols names from A1, B1 ... to RU format
    EXCEL_HEADERS.forEach((col, index) => {
        const cellAddress = XLSX.utils.encode_cell({r: 0, c: index})
        if (worksheet[cellAddress])
            worksheet[cellAddress].v = col.label
    })
    worksheet['!cols'] = [
        {wch: 30},
        {wch: 20},
        {wch: 20},
        {wch: 15},
        {wch: 15},
        {wch: 30},
        {wch: 30}, //
        {wch: 10}, //klimov
        {wch: 10}, //holland
        {wch: 10}, //yovaishi
        {wch: 10}
    ]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Пользователи')
    XLSX.writeFile(workbook, fileName)

}
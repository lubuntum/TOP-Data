
export interface UserExport {
    parent_full_name: string
    child_full_name: string
    city: string | null
    school_number: string
    class_number: number
    class_label: string
    phone: string
    created_at: string
    tests: Record<string, any>
}
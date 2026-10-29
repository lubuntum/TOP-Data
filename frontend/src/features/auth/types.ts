export interface RegisterRequest {
    parent_full_name: string
    child_full_name: string
    school_number: string
    class_number: number
    class_label: string
    phone: string
    consent_pd: boolean
    consent_testing: boolean
}
export interface RegisterResponse{
    login: string
    password: string
    message: string
}
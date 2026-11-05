
export interface TestOption {
    id: number
    text: string
    type?: string
    isPicked?: boolean
}
export interface TestQuestion {
    id: number
    text: string | null
    taskNumber?: number
    direction?: number
    options: TestOption[]
    userAnswer?: number
}
export interface TestDataResponse {
    data?: TestQuestion[]
}
import axios from "axios"
export const apiClient = axios.create({
    baseURL: "/api/v1",
    headers: {
        "Content-Type": "application/json"
    }, 
    // Helps to accept httpOnly cookies
    withCredentials: true
})
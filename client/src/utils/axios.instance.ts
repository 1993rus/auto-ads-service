import axios from "axios";

export const $api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
})

let accessToken: string = ''

export const setAccessToken = (newToken: string): void => {
    accessToken = newToken
}

// REQUEST INTERCEPTOR - добавляет Authorization header к каждому запросу
$api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
import axios from "axios";

export const $api = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true
})

let accessToken: string = ''

export const setAccessToken = (newToken: string): void => {
    accessToken = newToken
}
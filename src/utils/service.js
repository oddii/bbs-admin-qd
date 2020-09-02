import axios from 'axios'

import {
    message
} from 'antd'

import {
    CONFIG
} from '../constant'

const service = axios.create({
    baseURL: CONFIG.baseUrl,
    timeout: 5000,
    withCredentials: true
})

service.interceptors.request.use(config => {
    config.headers.Authorization = localStorage.getItem('token')
    return config
}, error => {
    console.log(error);
    message.error(`${error}`)
    return new Promise.reject(error)
})

service.interceptors.response.use(config => {
    return config
})

export default service
import request from './request'
import {
    HTTPMETHODS
} from '../constant'

export const getData = (url, params = {}) => {
    return request({
        url,
        method: HTTPMETHODS.GET,
        params
    })
}

export const postData = (url, data = {}) => {
    return request({
        url,
        method: HTTPMETHODS.POST,
        data
    })
}

import service from './service'
import qs from 'qs'
import {
    CONFIG
} from '../constant'


export default params => {
    const {
        url,
        method
    } = params
    const requestConfig = {
        url,
        method,
        headers: {}
    }

    //  配置请求内容类型
    if (params.ctxType === 'formdata') Object.assign(requestConfig.headers, CONFIG.ctxFormDataHeader)
    else Object.assign(requestConfig.headers, CONFIG.ctxJsonHeader)

    if (params.params && !params.data) {
        // 将url参数配置进axios实例
        requestConfig.params = params.params
    }

    if (!params.params && params.data) {
        if (params.ctxType === 'formdata') requestConfig.data = qs.stringify(params.data)
        else requestConfig.data = params.data
    }

    return new Promise((resolve, reject) => {
        service.request(requestConfig)
            .then(result => resolve(result))
            .catch(error => reject(error))
    })

}
export const ACTIONS = {
    SET_USER_DATA: 'setUserData',
    HANDLE_COLLAPSED: 'handleCollapsed'
}

export const DRAWER_TYPE = {
    INSERT: 'insert',
    UPDATE: 'update'
}

export const HTTPMETHODS = {
    GET: 'get',
    POST: 'post'
}

export const REGEXP = {
    username: /[A-Za-z0-9_]{1,30}/,
    password: /[\u0020-\u007e]{6,20}/
}

export const CONFIG = {
    // baseUrl: 'http://rap2.taobao.org:38080/app/mock/263117',
    // baseUrl: 'http://forum.frp.wegfan.cn/',
    baseUrl: 'http://forum-admin.wegfan.cn/',
    ctxJsonHeader: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    ctxFormDataHeader: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    emailRegExp: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
}
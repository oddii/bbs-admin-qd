import React, { useState, useEffect } from 'react'

import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, CodeOutlined, LoadingOutlined } from '@ant-design/icons';

import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'


import { getData, postData } from '../../utils/apiMethods'
import userApi from '../../api/user'
import { ACTIONS, REGEXP } from '../../constant'
import './index.scss'

const loadingKey = 'loading'

function Login() {

    const history = useHistory()
    const dispatch = useDispatch()
    const user = useSelector(state => state.userReducer)

    const [verifyCodeImg, setVerifyCodeImg] = useState('')
    const [verifyCodeRandom, setVerifyCodeRandom] = useState('123')

    /**
     * 获取验证码图片
     */
    const getVerifyCodeImg = () => {
        getData(userApi.refreshCode).then(result => {
            const { code, data } = result.data

            if (code !== 200) return message.error('')
            setVerifyCodeImg(data.url)
            setVerifyCodeRandom(data.verifyCodeRandom)
        })
    }

    /**
     * 登录事件
     * @param {表单信息}} values 
     */
    const login = values => {
        message.loading({ content: '正在登录...', key: loadingKey })
        const { username, password, verifyCode } = values
        postData(userApi.login, {
            username,
            password,
            verifyCode,
            verifyCodeRandom
        }).then(result => {
            const { code, data, msg, errorData } = result.data

            if (code !== 200) {
                if (errorData) return message.error(errorData.username
                    || errorData.password || errorData.verifyCode)
                return message.error(msg)
            }

            console.log(data);

            const { id, permission } = data
            const { admin, boardAdmin, categoryAdmin, superBoardAdmin } = permission
            const canLogin = admin || boardAdmin || categoryAdmin || superBoardAdmin

            if (canLogin) {
                localStorage.setItem('userId', id)
                getUserInfo(id)
            } else {
                message.error('对不起，您未获得登录后台的权限！')
            }
        }).catch(error => {
            message.error('连接超时，请稍后再试！')
        })
    }

    /**
     * 根据用户Id获取用户信息
     * @param {用户Id} userId 
     */
    const getUserInfo = id => {
        getData(userApi.getUserInfo, { userId: id }).then(async result => {
            const { code, data, msg } = await result.data
            if (code !== 200) return message.error(msg)
            dispatch({ type: ACTIONS.SET_USER_DATA, user: data })

            message.destroy(loadingKey)
            history.push('/admin')
        }).catch(() => {
            message.error('连接超时，请稍后再试！')
        })
    }

    /**
     * 自定义错误验证提醒
     * @param {错误字段} errorFields 
     */
    const handleOnFinishFailed = ({ errorFields }) => {
        const { errors: firstErrors } = errorFields[0]
        message.error(`${firstErrors[0]}`)
    }

    useEffect(() => {
        getVerifyCodeImg()
    }, [])

    const loadingIcon = <LoadingOutlined style={{ fontSize: 15 }} spin />   //  验证码 loadingIcon
    /**
     * 验证码 loading 组件
     */
    const codeImgOrLoading = () => {
        return verifyCodeImg
            ? (<img src={verifyCodeImg} alt="" onClick={() => getVerifyCodeImg()} />)
            : (<Spin indicator={loadingIcon} />)
    }

    return (
        <div className="login-wrapper">
            <Card
                title="东软论坛后台管理系统"
                headStyle={{ fontWeight: '600' }}
                className="login-container"
                bordered>

                <Form
                    name="loginForm"
                    onFinish={login}
                    onFinishFailed={handleOnFinishFailed}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入你的用户名！' },
                        { min: 1, max: 30, message: '用户名长度需要在1和30之间！' },
                        { pattern: REGEXP.username, message: '用户名只能包含大小写字母、数字、下划线！' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入你的用户密码！' },
                        { min: 6, max: 20, message: '用户密码长度需要在6和20之间！' },]}
                    >
                        <Input
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="用户密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="verifyCode"
                        rules={[{ required: true, message: '请输入你的验证码！' },
                        { len: 4, message: '验证码长度只能为4位！' }]}
                    >
                        <Input
                            prefix={<CodeOutlined />}
                            placeholder="验证码"
                            addonAfter={codeImgOrLoading()}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="btn-login">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

        </div>
    )
}

export default Login
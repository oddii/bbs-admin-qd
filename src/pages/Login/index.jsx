import React, { useState, useEffect } from 'react'

import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, CodeOutlined, LoadingOutlined } from '@ant-design/icons';

import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { getData, postData } from '../../utils/apiMethods'
import userApi from '../../api/user'
import { ACTIONS } from '../../constant'
import './index.scss'

function Login() {

    const history = useHistory()
    const dispatch = useDispatch()

    const [verifyCodeImg, setVerifyCodeImg] = useState('')
    const [verifyCodeRandom, setVerifyCodeRandom] = useState('')

    /**
     * 获取验证码图片
     */
    const getVerifyCodeImg = () => {
        getData(userApi.refreshCode).then(result => {
            const { code, data } = result.data
            console.log(result.data);
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
        const { username, password, verifyCode } = values
        postData(userApi.login, {
            username,
            password,
            verifyCode,
            verifyCodeRandom
        }).then(result => {
            const { code, data } = result.data
            console.log(data);
            if (code !== 200) return message.error('')
            const { id } = data
            localStorage.setItem('userId', id)
            dispatch({ type: ACTIONS.SET_USER_DATA, user: data })
            history.push('/admin')
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
                        rules={[{ required: true, message: '请输入你的用户名！' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入你的用户密码！' }]}
                    >
                        <Input
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="用户密码"
                        />
                    </Form.Item>

                    <Form.Item
                        name="verifyCode"
                        rules={[{ required: true, message: '请输入你的验证码！' }]}
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
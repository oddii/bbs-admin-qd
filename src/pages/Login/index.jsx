import React from 'react'

import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { useHistory } from 'react-router-dom'

import './index.scss'

function Login() {

    const history = useHistory()

    const login = values => {
        history.push('/admin')
    }

    const handleOnFinishFailed = ({ errorFields }) => {
        const { errors: firstErrors } = errorFields[0]
        message.error(`${firstErrors[0]}`)
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
                    initialValues={{ remember: true }}
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
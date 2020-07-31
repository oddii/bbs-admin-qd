import React, { useState } from 'react'
import { Card, Table, Dropdown, Menu, Avatar, Button, Drawer, Form, Input, Select, message, Popconfirm, Divider, Badge } from 'antd'

import '../../index.scss'

const { Column } = Table;
const { Option } = Select

const data = []
for (let i = 0; i < 10; i++) {
    let index = Math.floor(Math.random() * 3)
    data.push({
        id: i,
        username: `user${i}`,
        nickname: `用户${i}`,
        email: `79352318${i}@qq.com`,
        avatar_path: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
        last_login_time: new Date().toLocaleString(),
        last_login_ip: '111.111.111.111',
        sex: ([0, 1, 2])[index],
        signature: '这个人很懒，什么都没留下来',
        register_time: new Date().toLocaleString(),
        update_time: new Date().toLocaleString()
    })
}

function UserList() {

    const [drawerVisible, setDrawerVisible] = useState(false)
    const [userForm] = Form.useForm()

    const handleItemInsert = () => {
        userForm.setFieldsValue({
            name: '',
            description: '',
            order: 1
        })
        setDrawerVisible(true)
    }

    const handleItemDelete = item => {
        console.log(item);
        message.success(`成功删除名称为 “${item.username}” 的用户！`)
    }

    const handleDrawerCancel = () => {
        setDrawerVisible(false)
    }

    const handleDrawerConfirm = () => {
        userForm.validateFields(['name', 'description', 'visible', 'order'])
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    return (
        <>
            <Card
                title="用户列表"
                extra={<Button onClick={handleItemInsert}>新增用户</Button>} >

                <Table
                    rowKey="id"
                    dataSource={data}
                    expandable={{
                        expandedRowRender: record => <p style={{ margin: 0 }}>{record.signature}</p>,
                        rowExpandable: record => record.username !== 'Not Expandable',
                    }}
                    pagination={{
                        total: 85,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`
                    }}>
                    <Column
                        title="头像"
                        dataIndex="avatar_path"
                        key="avatar_path"
                        align="center"
                        width={70}
                        render={path => <Avatar src={path} />} />
                    <Column title="用户名" dataIndex="username" key="username" align="center" width={180} ellipsis />
                    <Column title="昵称" dataIndex="nickname" key="nickname" align="center" width={180} ellipsis />
                    <Column title="绑定邮箱" dataIndex="email" key="age" align="center" ellipsis />
                    <Column
                        title="性别"
                        dataIndex="sex"
                        key="sex"
                        align="center"
                        width={80}
                        render={sex => {
                            if (sex === 0) return <Badge status="processing" text="男生" />
                            else if (sex === 1) return <Badge status="error" text="女生" />
                            else if (sex === 2) return <Badge status="default" text="保密" />
                        }} />
                    <Column title="上次登录ip地址" dataIndex="last_login_ip" key="last_login_ip" align="center" width={150} />
                    <Column title="上次登录时间" dataIndex="last_login_time" key="last_login_time" align="center" width={180} />
                    <Column title="注册时间" dataIndex="register_time" key="register_time" align="center" width={180} />
                    <Column title="更新时间" dataIndex="update_time" key="update_time" align="center" width={180} />
                    <Column
                        title="操作"
                        key="action"
                        align="center"
                        width={120}
                        render={(text, record) => (
                            <>
                                <Dropdown
                                    overlay={
                                        <Menu>
                                            <Menu.Item>
                                                <div>编辑</div>
                                            </Menu.Item>

                                            <Menu.Item>
                                                <div>权限</div>
                                            </Menu.Item>
                                        </Menu>}>
                                    <span className="btn-option">更多</span>
                                </Dropdown>

                                <Divider type="vertical" />

                                <Popconfirm
                                    title="删除后不可恢复，您确认删除本项吗？"
                                    onConfirm={() => handleItemDelete(record)}
                                    okText="是的！"
                                    cancelText="我再想想..."
                                >
                                    <span className="btn-option-danger">删除</span>
                                </Popconfirm>
                            </>
                        )}
                    />
                </Table>
            </Card >

            <Drawer
                title="新建用户"
                width={400}
                onClose={handleDrawerCancel}
                visible={drawerVisible}
                maskClosable={false}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleDrawerCancel} style={{ marginRight: 8 }}>取消</Button>
                        <Button type="primary" onClick={handleDrawerConfirm}>提交</Button>
                    </div>
                }>

                <Form
                    form={userForm}
                    initialValues={{ order: 1 }}
                    hideRequiredMark
                >
                    <Form.Item
                        name="username"
                        label="用户名称"
                        rules={[{ required: true, message: '请输入用户名称!' },
                        { type: 'string', max: 30, message: '用户名称不能超过30个字符！' }]}
                    >
                        <Input placeholder="请输入用户名称" />
                    </Form.Item>

                    <Form.Item
                        name="nickname"
                        label="用户昵称"
                        rules={[{ required: true, message: '请输入用户昵称!' },
                        { type: 'string', max: 30, message: '用户昵称不能超过30个字符！' }]}
                    >
                        <Input placeholder="请输入用户昵称" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="用户密码"
                        rules={[{ required: true, message: '请输入用户密码!' },
                        { type: 'string', max: 64, message: '用户密码不能超过64个字符！' }]}
                    >
                        <Input.Password placeholder="请输入用户密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        rules={[{ required: true, message: '请输入确认密码!' },
                        { type: 'string', max: 64, message: '确认密码不能超过64个字符！' }]}
                    >
                        <Input.Password placeholder="请输入确认密码" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱地址"
                        rules={[{ required: true, message: '请输入邮箱地址!' },
                        { type: 'string', max: 255, message: '用户昵称不能超过255个字符！' }]}
                    >
                        <Input type="email" placeholder="请输入邮箱地址" />
                    </Form.Item>

                    <Form.Item
                        name="sex"
                        label="用户性别"
                        rules={[{ required: true, message: '请选择用户性别!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value="0">男生</Option>
                            <Option value="1">女生</Option>
                            <Option value="2">保密</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="signature"
                        label="个人签名"
                        rules={[{ type: 'string', max: 500, message: '个人签名不能超过500个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入个人签名" autoSize={{ minRows: 2, maxRows: 8 }} />
                    </Form.Item>

                    <Divider />

                    <Form.Item
                        name="password_hint_question"
                        label="提示问题"
                        rules={[{ type: 'string', max: 40, message: '找回密码提示问题不能超过40个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入找回密码提示问题（找回密码用）" autoSize={{ minRows: 2, maxRows: 8 }} />
                    </Form.Item>

                    <Form.Item
                        name="password_hint_answer"
                        label="问题答案"
                        rules={[
                            { type: 'string', max: 40, message: '找回密码问题答案不能超过40个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入找回密码问题答案（找回密码用）" autoSize={{ minRows: 2, maxRows: 8 }} />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    )
}

export default UserList
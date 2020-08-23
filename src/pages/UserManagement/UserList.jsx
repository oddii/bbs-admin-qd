import React, { useState, useEffect } from 'react'
import {
    Card, Table, Dropdown, Menu, Avatar, Button, Drawer, Tag,
    Form, Input, Select, message, Popconfirm, Divider, Badge,
    AutoComplete, Cascader, Col, Row, DatePicker, Statistic, Switch
} from 'antd'
import moment from 'moment'

import { debounce } from '../../utils/utils'
import userApi from '../../api/user'
import { getData } from '../../utils/apiMethods'
import '../../index.scss'

const { Column } = Table;
const { Option } = Select
/**
 * 渲染自动完成选项的 item
 * @param {自动完成选项} item 
 */
const renderAutoCompleteItem = item => ({
    value: item.username,
    label: (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <span>{item.username}</span>
            <span>{item.nickname}</span>
        </div>
    ),
})

function UserList() {

    const [userForm] = Form.useForm()
    const [searchForm] = Form.useForm()
    const [drawerVisible, setDrawerVisible] = useState(false)

    const [autoCompleteList, setAutoCompleteList] = useState([])
    const [username, setUsername] = useState('')
    const [userType, setUsertype] = useState('')

    const [userList, setUserList] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(0)
    const [total, setTotal] = useState(0)

    /**
     * 通用 useState 的 Setter
     * @param {属性字段} property 
     */
    const commonSetter = property => {
        const obj = {
            // boardId: setBoardId,
            // username: setUsername,
            // keyword: setKeyword,
            // type: setType,
            // sort: setSort,
            // from: setFrom,
            // to: setTo
        }
        return obj[property]
    }

    /**
     * 获取用户列表
     * @param {参数} params 
     */
    const getUserList = (params = {}) => {
        getData(userApi.getUserList, params).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            const { content, currentPage, pageSize, totalRecords } = data
            setUserList(content)
            setCurrentPage(currentPage)
            setPageSize(pageSize)
            setTotal(totalRecords)
        })
    }

    /**
     * 自动完成输入框输入事件
     * @param {自动完成输入框值} value 
     */
    const handleAutoComplete = value => {
        getData(userApi.getUsernameList, { user: value })
            .then(result => {
                let { code, data } = result.data
                if (code !== 200) return message.error('')
                data = data.map(item => renderAutoCompleteItem(item))
                setAutoCompleteList(data)
            })
    }

    /**
     * 表单搜索事件
     * @param {表单值} values 
     */
    const handleSearch = values => {
        console.log(values);
        const params = {}
        for (let key in values) {
            if (values.hasOwnProperty(key)) {
                if (key === 'from' || key === 'to') {
                    if (values[key]) {
                        params[key] = moment(values[key]).format('YYYY-MM-DD hh:mm:ss')
                    }
                } else if (key === 'boardId') {
                    if (values[key]) {
                        params[key] = values[key][values[key].length - 1]
                    }
                } else {
                    params[key] = values[key]
                }
                commonSetter(key)(values[key])
            }
        }
        params.page = currentPage
        params.count = pageSize
        getUserList(params)
    }

    /**
     * 表单重置事件
     */
    const handleReset = () => {
        setAutoCompleteList([])
        setUsername('')
        setUsertype('')
        searchForm.resetFields()
    }

    /**
     * 页数与页面大小改变事件
     * @param {参数} params 
     */
    const handlePageChange = (params = {}) => {
        const searchFormOldValue = {
            // boardId,
            // username,
            // filename: keyword,
            // type,
            // sort,
            // from,
            // to
        }
        searchForm.setFieldsValue(searchFormOldValue)
        for (let key in searchFormOldValue) {
            if (searchFormOldValue.hasOwnProperty(key)) {
                if (searchFormOldValue[key]) {
                    if (key === 'from' || key === 'to') {
                        params[key] = moment(searchFormOldValue[key]).format('YYYY-MM-DD hh:mm:ss')
                    } else if (key === 'boardId') {
                        params[key] = searchFormOldValue[key][searchFormOldValue[key].length - 1]
                    } else {
                        params[key] = searchFormOldValue[key]
                    }
                }
            }
        }
        getUserList(params)
    }

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
        userForm.validateFields(['username', 'nickname', 'password', 'confirmPassword', 'email', 'admin',
            'banVisit', 'banCreateTopic', 'banReply', 'banUploadAttachment', 'banDownloadAttachment'])
            .then(result => {
                console.log(result);
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    useEffect(() => {
        getUserList({
            page: 1,
            count: 10
        })
    }, [])

    return (
        <>
            <Card
                title="用户列表"
                extra={<Button onClick={handleItemInsert}>新建用户</Button>}>
                <Form
                    form={searchForm}
                    onFinish={handleSearch}
                >
                    <Row gutter={24}>
                        <Col span={6} >
                            <Form.Item name='username' label='上传用户' >
                                <AutoComplete
                                    allowClear
                                    dropdownMatchSelectWidth={250}
                                    options={autoCompleteList}
                                    onSearch={debounce(handleAutoComplete, 500)}
                                    placeholder="请输入用户名/用户昵称"
                                />
                            </Form.Item>
                        </Col>

                        <Col span={6} >
                            <Form.Item name='userType' label='用户类型'>
                                <Select placeholder="请选择用户类型" allowClear>
                                    <Option value="user">普通用户</Option>
                                    <Option value="boardAdmin">版主</Option>
                                    <Option value="categoryAdmin">分区版主</Option>
                                    <Option value="superBoardAdmin">超级版主</Option>
                                    <Option value="admin">管理员</Option>
                                    <Option value="banVisit">禁止登录</Option>
                                    <Option value="banReply">禁止发帖/回帖</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        {/* <Col span={6} >
                            <Form.Item name='from' label='开始时间' style={{ marginBottom: 0 }}>
                                <DatePicker showTime />
                            </Form.Item>
                        </Col>

                        <Col span={6} >
                            <Form.Item name='to' label='结束时间' style={{ marginBottom: 0 }}>
                                <DatePicker showTime />
                            </Form.Item>
                        </Col> */}

                        <Col span={24} style={{ textAlign: 'right' }}>
                            <Button type="primary" htmlType="submit">
                                搜索
                            </Button>
                            <Button
                                style={{ margin: '0 8px' }}
                                onClick={() => handleReset()}>
                                清空
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card
                style={{ marginTop: 24 }}>

                <Table
                    rowKey="id"
                    dataSource={userList}
                    expandable={{
                        expandedRowRender: record => {
                            return <Card style={{ fontSize: 14 }}>
                                <Row>
                                    <Col span={21}>
                                        <Row style={{ marginBottom: 14 }}>
                                            最近登录Ip：{record.lastLoginIp}
                                        </Row>
                                        <Row style={{ marginBottom: 14 }}>
                                            个性签名：{record.signature}
                                        </Row>
                                        <Row>
                                            <Col>
                                                管理板块：{
                                                    record.boardAdmin.map(item => <Tag closable key={item.id} color="processing"
                                                        style={{ fontSize: 14, margin: '0 12px 14px 0' }}>
                                                        {item.name}
                                                    </Tag>)
                                                }
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                管理分区：{
                                                    record.categoryAdmin.map(item => <Tag closable key={item.id} color="warning"
                                                        style={{ fontSize: 14, margin: '0 12px 14px 0' }}>
                                                        {item.name}
                                                    </Tag>)
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={3}>
                                        <Row>
                                            {
                                                record.superBoardAdmin
                                                    ? <Col span={12} style={{ marginBottom: 10 }}>
                                                        <Badge status="success" text="超级版主" />
                                                    </Col>
                                                    : <></>
                                            }
                                            {
                                                record.admin
                                                    ? <Col span={12} style={{ marginBottom: 10 }}>
                                                        <Badge status="processing" text="管理员" />
                                                    </Col>
                                                    : <></>
                                            }
                                        </Row>
                                        <Row>
                                            <Col span={12}><Statistic title="发帖总数" value={record.topicCount} /></Col>
                                            <Col span={12}><Statistic title="回复总数" value={record.replyCount} /></Col>
                                        </Row>
                                        <Row style={{ marginBottom: 7, marginTop: 7 }}>
                                            禁止登录：<Switch defaultChecked />
                                        </Row>
                                        <Row style={{ marginBottom: 7 }}>
                                            禁止发帖：<Switch defaultChecked />
                                        </Row>
                                        <Row style={{ marginBottom: 7 }}>
                                            禁止回复：<Switch defaultChecked />
                                        </Row>
                                        <Row style={{ marginBottom: 7 }}>
                                            禁止上传附件：<Switch defaultChecked />
                                        </Row>
                                        <Row>
                                            禁止下载附件：<Switch defaultChecked />
                                        </Row>
                                    </Col>
                                </Row>
                            </Card>
                        },
                        rowExpandable: record => record.username !== 'Not Expandable',
                    }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`,
                        onChange: (currentPage, pageSize) => handlePageChange({ page: currentPage, count: pageSize })
                    }}>
                    <Column
                        title="头像"
                        dataIndex="avatarPath"
                        key="avatarPath"
                        align="center"
                        width={70}
                        render={avatarPath => <Avatar src={avatarPath} />} />
                    <Column title="用户名" dataIndex="username" key="username" align="center" width={180} ellipsis />
                    <Column title="昵称" dataIndex="nickname" key="nickname" align="center" width={180} ellipsis />
                    <Column title="用户类型" dataIndex="userType" key="userType" align="center" width={150} />
                    <Column title="绑定邮箱" dataIndex="email" key="email" align="center" ellipsis />
                    <Column
                        title="是否激活"
                        dataIndex="emailVerified"
                        key="emailVerified"
                        align="center"
                        width={100}
                        render={emailVerified => {
                            return emailVerified
                                ? <Tag color="success">已激活</Tag>
                                : <Tag color="error">未激活</Tag>
                        }} />
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
                    <Column title="注册时间" dataIndex="registerTime" key="registerTime" align="center" width={180} />
                    <Column title="最近登录时间" dataIndex="lastLoginTime" key="lastLoginTime" align="center" width={180} />
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
                    initialValues={{
                        banVisit: false, banCreateTopic: false, banReply: false, admin: false,
                        banUploadAttachment: false, banDownloadAttachment: false
                    }}
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
                        name="admin"
                        label="是否为管理员"
                        rules={[{ required: true, message: '请选择是否为管理员!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Divider />

                    <Form.Item
                        name="banVisit"
                        label="是否禁止登录"
                        rules={[{ required: true, message: '请选择是否禁止登录!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banCreateTopic"
                        label="是否禁止发帖"
                        rules={[{ required: true, message: '请选择是否禁止发帖!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banReply"
                        label="是否禁止回复"
                        rules={[{ required: true, message: '请选择是否禁止回复!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banUploadAttachment"
                        label="是否禁止上传附件"
                        rules={[{ required: true, message: '请选择是是否禁止上传附件!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banDownloadAttachment"
                        label="是否禁止下载附件"
                        rules={[{ required: true, message: '请选择是是否禁止下载附件!' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    )
}

export default UserList
import React, { useState, useEffect } from 'react'
import {
    Card, Table, Avatar, Button, Drawer, Tag,
    Form, Input, Select, message, Popconfirm, Divider, Badge,
    AutoComplete, Modal, Col, Row, Cascader, Statistic, Switch
} from 'antd'
import { PlusOutlined, FileProtectOutlined, AuditOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { debounce } from '../../utils/utils'
import userApi from '../../api/user'
import categoryApi from '../../api/category'
import boardApi from '../../api/board'
import { getData, postData } from '../../utils/apiMethods'
import { REGEXP, CONFIG } from '../../constant'
import '../../index.scss'

const { Column } = Table;
const { Option } = Select

//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

const renderAutoCompleteTitle = () => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 12
        }}>
        <span>用户名</span>
        <span>昵称</span>
    </div>
)

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

    const history = useHistory()
    const [userForm] = Form.useForm()
    const [searchForm] = Form.useForm()
    const [drawerVisible, setDrawerVisible] = useState(false)

    const [autoCompleteList, setAutoCompleteList] = useState([])
    const [username, setUsername] = useState('')
    const [userType, setUsertype] = useState('')

    const [userList, setUserList] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const [userInfo, setUserInfo] = useState({})

    const [adminInsertModalVisible, setAdminInsertModalVisible] = useState(false)
    const [adminInsertModalType, setAdminInsertModalType] = useState('')
    const [boardNameList, setBoardNameList] = useState([])
    const [categoryNameList, setCategoryNameList] = useState([])
    const [boardSelectId, setBoardSelectId] = useState(0)
    const [categorySelectId, setCategorySelectId] = useState(0)

    const [permissionModalVisible, setPermissionModalVisible] = useState(false)
    const [permissionModalType, setPermissionModalType] = useState('')
    const [forumPermissionForm] = Form.useForm()

    const [boardPermissionInfo, setBoardPermissionInfo] = useState(false)
    const [boardPermissionModalVisible, setBoardPermissionModalVisible] = useState(false)
    const [boardPermissionModalType, setBoardPermissionModalType] = useState('')
    const [boardPermissionForm] = Form.useForm()

    /**
     * 通用 useState 的 Setter
     * @param {属性字段} property 
     */
    const commonSetter = property => {
        const obj = {
            username: setUsername,
            userType: setUsertype
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
        if (!value) return
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
                if (values[key]) {
                    params[key] = values[key]
                }
                commonSetter(key)(values[key])
            }
        }
        params.page = 1
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
            username,
            userType
        }
        searchForm.setFieldsValue(searchFormOldValue)
        for (let key in searchFormOldValue) {
            if (searchFormOldValue.hasOwnProperty(key)) {
                if (searchFormOldValue[key]) {
                    params[key] = searchFormOldValue[key]
                }
            }
        }
        getUserList(params)
    }

    const handleToItemInfo = id => {
        history.push(`/admin/user/center/${id}`)
    }

    const handleItemInsert = () => {
        userForm.setFieldsValue({
            username: '',
            nickname: '',
            password: '',
            confirmPassword: '',
            email: '',
            admin: false,
            banVisit: false,
            banCreateTopic: false,
            banReply: false,
            banUploadAttachment: false,
            banDownloadAttachment: false
        })
        setDrawerVisible(true)
    }

    const handleItemDelete = item => {
        postData(userApi.delUser, { id: item.id }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success(`成功删除名称为 “${item.username}” 的用户！`)
            getUserList({
                page: currentPage,
                count: pageSize
            })
        })
    }

    const handleDrawerCancel = () => {
        setDrawerVisible(false)
    }

    /**
     * 新建用户确认事件
     */
    const handleDrawerConfirm = () => {
        userForm.validateFields(['username', 'nickname', 'password', 'confirmPassword', 'email', 'admin',
            'banVisit', 'banCreateTopic', 'banReply', 'banUploadAttachment', 'banDownloadAttachment'])
            .then(result => {
                const { username, nickname, email, admin, password, confirmPassword, banVisit, banCreateTopic,
                    banReply, banUploadAttachment, banDownloadAttachment } = result

                if (password !== confirmPassword) return message.error('两次密码输入不一致，请重新输入1')
                const forumPermission = {
                    banVisit,
                    banCreateTopic,
                    banReply,
                    banUploadAttachment,
                    banDownloadAttachment
                }

                postData(userApi.addUser, {
                    username,
                    nickname,
                    email,
                    admin,
                    password,
                    forumPermission
                }).then(result => {
                    const { code, msg, errorData } = result.data
                    if (code !== 200) {
                        if (errorData) return message.error('')
                        return message.error(msg)
                    }
                    message.success('新建成功！')
                    getUserList({
                        page: currentPage,
                        count: pageSize
                    })
                    handleDrawerCancel()
                })
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    const getBoardNameList = () => {
        getData(boardApi.getBoardNameList).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setBoardNameList(data)
        }).catch(error => {
            console.log(error);
        })
    }

    const getCategoryNameList = () => {
        getData(categoryApi.getCategoryNameList).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setCategoryNameList(data)
        }).catch(error => {
            console.log(error);
        })
    }

    /**
     * 根据 type 打开添加版主/分区版主 Modal 事件
     * @param {用户信息} item 
     * @param {Modal 类型} type 
     */
    const handleAdminInsertModalShow = (item, type) => {
        type === 'board' ? getBoardNameList() : getCategoryNameList()
        setUserInfo(item)
        setAdminInsertModalType(type)
        setAdminInsertModalVisible(true)
    }

    /**
     * 
     * @param {用户信息} userInfo 
     * @param {点击项} item 
     */
    const handleBoardAdminDelete = (userInfo, item) => {
        let boardIdList = userInfo.boardAdmin.map(item => item.id).filter(boardId => item.id !== boardId)
        postData(userApi.updateBoardAdmin, {
            userId: userInfo.id,
            boardIdList
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            getUserList({
                page: currentPage,
                count: pageSize
            })
            message.success('移除管理板块成功！')
        })
    }

    /**
     * 
     * @param {用户信息} userInfo 
     * @param {点击项} item 
     */
    const handleCategoryAdminDelete = (userInfo, item) => {
        let categoryIdList = userInfo.categoryAdmin.map(item => item.id).filter(categoryId => item.id !== categoryId)
        postData(userApi.updateCategoryAdmin, {
            userId: userInfo.id,
            categoryIdList
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            getUserList({
                page: currentPage,
                count: pageSize
            })
            message.success('移除管理分区成功！')
        })
    }

    /**
     * 添加版主或分区版主确认事件
     */
    const handleAdminInsertConfirm = () => {
        if (adminInsertModalType === 'board') {
            if (boardSelectId.length === 0) return message.error('请选择管理板块')
            let boardIdList = userInfo.boardAdmin.map(item => item.id).concat(boardSelectId[1])
            postData(userApi.updateBoardAdmin, {
                userId: userInfo.id,
                boardIdList
            }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                setAdminInsertModalVisible(false)
                getUserList({
                    page: currentPage,
                    count: pageSize
                })
                message.success('添加管理板块成功！')
            })

        } else if (adminInsertModalType === 'category') {
            if (!categorySelectId) return message.error('请选择管理分区')
            let categoryIdList = userInfo.categoryAdmin.map(item => item.id).concat(categorySelectId)
            postData(userApi.updateCategoryAdmin, {
                userId: userInfo.id,
                categoryIdList
            }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                setAdminInsertModalVisible(false)
                getUserList({
                    page: currentPage,
                    count: pageSize
                })
                message.success('添加管理分区成功！')
            })

        }
    }

    /**
     * 根据 type 打开修改用户论坛权限/指定板块权限 Modal 事件
     * @param {用户信息} item 
     * @param {Modal 类型} type 
     */
    const handlePermissionModalShow = (item, type) => {
        type === 'forum' && forumPermissionForm.setFieldsValue(item.forumPermission)
        setUserInfo(item)
        setPermissionModalType(type)
        setPermissionModalVisible(true)
    }

    /**
     * 修改用户权限确认事件
     */
    const handlePermisionChangeConfirm = () => {

        forumPermissionForm.validateFields().then(values => {
            postData(userApi.updateUserForumPermission, { userId: userInfo.id, ...values }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                message.success('修改用户论坛权限成功！')
                getUserList({
                    page: currentPage,
                    count: pageSize
                })
                setPermissionModalVisible(false)
            })
        })
    }

    /**
     * 打开新增/修改用户指定板块权限 Modal 事件
     * @param {Modal 类型} type 
     * @param {板块权限信息} item 
     */
    const handleBoardPermissionModalShow = (type, item) => {
        if (type === 'insert') {
            getBoardNameList()
            boardPermissionForm.setFieldsValue({
                banVisit: false,
                banCreateTopic: false,
                banReply: false,
                banUploadAttachment: false,
                banDownloadAttachment: false
            })
        } else if (type === 'update') {
            setBoardPermissionInfo(item)
            boardPermissionForm.setFieldsValue({
                banVisit: item.banVisit,
                banCreateTopic: item.banCreateTopic,
                banReply: item.banReply,
                banUploadAttachment: item.banUploadAttachment,
                banDownloadAttachment: item.banDownloadAttachment
            })
        }
        setPermissionModalVisible(false)
        setBoardPermissionModalType(type)
        setBoardPermissionModalVisible(true)
    }

    /**
     * 关闭新增/修改用户指定板块权限 Modal 事件
     */
    const handleBoardPermissionModalCancel = () => {
        setBoardPermissionModalVisible(false)
        setPermissionModalVisible(true)
    }

    /**
     * 新增/修改用户指定板块权限确认事件
     */
    const handleBoardPermissionModalConfirm = () => {
        const boardId = boardPermissionModalType === 'insert'
            ? boardSelectId[1] : boardPermissionInfo.id

        boardPermissionForm.validateFields().then(values => {
            postData(userApi.updateUserBoardPermission, {
                userId: userInfo.id,
                boardId,
                ...values
            }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                getUserList({
                    page: currentPage,
                    count: pageSize
                })
                boardPermissionModalType === 'insert'
                    ? message.success('新建用户指定板块权限成功！')
                    : message.success('修改用户指定板块权限成功！')
                setBoardPermissionModalVisible(false)
            })
        })
    }

    useEffect(() => {
        getUserList({
            page: currentPage,
            count: pageSize
        })
    }, [currentPage, pageSize])

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
                            <Form.Item name='username' label='用户名称' >
                                <AutoComplete
                                    allowClear
                                    dropdownMatchSelectWidth={250}
                                    options={[{ label: renderAutoCompleteTitle(), options: autoCompleteList }]}
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
                                            个性签名：{
                                                record.signature
                                                    ? record.signature
                                                    : '这家伙很懒，什么都没留下来...'
                                            }
                                        </Row>
                                        <Row>
                                            <Col>
                                                管理板块：{
                                                    record.boardAdmin.map(item => <Tag
                                                        closable
                                                        key={item.id} color="processing"
                                                        style={{ fontSize: 14, margin: '0 12px 14px 0' }}
                                                        onClose={() => handleBoardAdminDelete(record, item)}>
                                                        {item.name}
                                                    </Tag>)
                                                }
                                                <Tag
                                                    icon={<PlusOutlined />}
                                                    color="default"
                                                    style={{ fontSize: 14, margin: '0 0 14px 0', cursor: 'pointer' }}
                                                    onClick={() => handleAdminInsertModalShow(record, 'board')}>
                                                    添加管理板块
                                                </Tag>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                管理分区：{
                                                    record.categoryAdmin.map(item => <Tag
                                                        closable
                                                        key={item.id} color="warning"
                                                        style={{ fontSize: 14, margin: '0 12px 14px 0' }}
                                                        onClose={() => handleCategoryAdminDelete(record, item)}>
                                                        {item.name}
                                                    </Tag>)
                                                }
                                                <Tag
                                                    icon={<PlusOutlined />}
                                                    color="default"
                                                    style={{ fontSize: 14, margin: '0 0 14px 0', cursor: 'pointer' }}
                                                    onClick={() => handleAdminInsertModalShow(record, 'category')}>
                                                    添加管理分区
                                                </Tag>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={3}>
                                        <Row>
                                            {
                                                record.admin
                                                    ? <Col span={12} style={{ marginBottom: 10 }}>
                                                        <Badge status="processing" text="管理员" />
                                                    </Col>
                                                    : <></>
                                            }
                                            {
                                                record.superBoardAdmin
                                                    ? <Col span={12} style={{ marginBottom: 10 }}>
                                                        <Badge status="success" text="超级版主" />
                                                    </Col>
                                                    : <></>
                                            }
                                        </Row>
                                        <Row>
                                            <Col span={12}><Statistic title="发帖总数" value={record.topicCount} /></Col>
                                            <Col span={12}><Statistic title="回复总数" value={record.replyCount} /></Col>
                                        </Row>
                                        <Row>
                                            <div style={{ fontSize: 14, marginBottom: 7, marginTop: 7 }}>权限控制：</div>
                                        </Row>
                                        <Row>
                                            <Col span={12} >
                                                <Button
                                                    type="default"
                                                    icon={<AuditOutlined />}
                                                    onClick={() => handlePermissionModalShow(record, 'board')}
                                                >板块</Button>
                                            </Col>
                                            <Col span={12} style={{ textAlign: 'right' }}>
                                                <Button
                                                    type="primary"
                                                    icon={<FileProtectOutlined />}
                                                    onClick={() => handlePermissionModalShow(record, 'forum')}
                                                >论坛</Button>
                                            </Col>
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
                        render={avatarPath => <Avatar src={CONFIG.baseUrl + avatarPath.substring(1, avatarPath.length)} />} />
                    <Column title="用户名" dataIndex="username" key="username" align="center" width={180} ellipsis
                        render={(text, record) =>
                            <Button type="link" onClick={() => handleToItemInfo(record.id)}>{record.username}</Button>
                        } />
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
                        width={65}
                        render={(text, record) => (
                            <>
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
                        rules={[{ required: true, message: '请输入用户名称！' },
                        { min: 1, max: 30, message: '用户名长度需要在1和30之间！' },
                        { pattern: REGEXP.username, message: '用户名只能包含大小写字母、数字、下划线！' }]}
                    >
                        <Input placeholder="请输入用户名称" />
                    </Form.Item>

                    <Form.Item
                        name="nickname"
                        label="用户昵称"
                        rules={[{ required: true, message: '请输入用户昵称！' },
                        { type: 'string', max: 30, message: '用户昵称需要在1和30之间！' }]}
                    >
                        <Input placeholder="请输入用户昵称" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="用户密码"
                        rules={[{ required: true, message: '请输入用户密码！' },
                        { min: 6, max: 20, message: '用户密码需要在6和20之间！' }]}
                    >
                        <Input.Password placeholder="请输入用户密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        rules={[{ required: true, message: '请输入确认密码！' },
                        { min: 6, max: 20, message: '确认密码需要在6和20之间！' }]}
                    >
                        <Input.Password placeholder="请输入确认密码" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱地址"
                        rules={[{ required: true, message: '请输入邮箱地址！' },
                        { type: 'email', message: '请输入合法的邮箱地址！' }]}
                    >
                        <Input type="email" placeholder="请输入邮箱地址" />
                    </Form.Item>

                    <Form.Item
                        name="admin"
                        label="是否为管理员"
                        rules={[{ required: true, message: '请选择是否为管理员！' }]}
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
                        rules={[{ required: true, message: '请选择是否禁止登录！' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banCreateTopic"
                        label="是否禁止发帖"
                        rules={[{ required: true, message: '请选择是否禁止发帖！' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banReply"
                        label="是否禁止回复"
                        rules={[{ required: true, message: '请选择是否禁止回复！' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banUploadAttachment"
                        label="是否禁止上传附件"
                        rules={[{ required: true, message: '请选择是是否禁止上传附件！' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="banDownloadAttachment"
                        label="是否禁止下载附件"
                        rules={[{ required: true, message: '请选择是是否禁止下载附件！' }]}
                    >
                        <Select style={{ width: '88px' }}>
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>

            <Modal
                title={adminInsertModalType === 'board' ? '添加管理板块' : '添加管理分区'}
                visible={adminInsertModalVisible}
                maskClosable={false}
                onCancel={() => setAdminInsertModalVisible(false)}
                footer={<Button type="primary" onClick={handleAdminInsertConfirm}>确定</Button>}
            >
                {
                    adminInsertModalType === 'board'
                        ? <Cascader
                            style={{ width: 200 }}
                            options={boardNameList}
                            fieldNames={boardNameListfieldNames}
                            onChange={value => setBoardSelectId(value)}
                            placeholder="请选择板块名称" />
                        : <Select
                            style={{ width: 200 }}
                            onChange={value => setCategorySelectId(value)}
                            placeholder="请选择分区名称">
                            {
                                categoryNameList.map(item =>
                                    <Option
                                        value={item.id}
                                        key={item.id}
                                    > {item.name}</Option>)
                            }
                        </Select>
                }
            </Modal>

            <Modal
                title={permissionModalType === 'forum' ? '修改论坛权限' : '修改指定定板块权限'}
                visible={permissionModalVisible}
                maskClosable={false}
                onCancel={() => setPermissionModalVisible(false)}
                width={permissionModalType === 'forum' ? 520 : 800}
                footer={
                    permissionModalType === 'forum'
                        ? <Button type="primary" onClick={handlePermisionChangeConfirm}>确定</Button>
                        : <Button onClick={() => handleBoardPermissionModalShow('insert')}>新建用户指定板块权限</Button>}
            >
                {
                    permissionModalType === 'forum'
                        ? <Form
                            form={forumPermissionForm}
                        >
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item name="banVisit" label="访问论坛" valuePropName="checked">
                                        <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name="banCreateTopic" label="创建帖子" valuePropName="checked">
                                        <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name="banReply" label="回复帖子" valuePropName="checked">
                                        <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item name="banUploadAttachment" label="上传附件" valuePropName="checked">
                                        <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name="banDownloadAttachment" label="下载附件" valuePropName="checked">
                                        <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                    </Form.Item>
                                </Col>
                            </Row>

                        </Form>
                        : <Table
                            rowKey="id"
                            pagination={false}
                            dataSource={userInfo.boardPermission}>
                            <Column title="板块名称" dataIndex="name" key="name" align="center" width={150} ellipsis />
                            <Column title="访问论坛" dataIndex="banVisit" key="banVisit" align="center" width={90}
                                render={(record, text) => !record ? <Tag color="success">允许</Tag> : <Tag color="error">禁止</Tag>} />
                            <Column title="创建帖子" dataIndex="banCreateTopic" key="banCreateTopic" align="center" width={90}
                                render={(record, text) => !record ? <Tag color="success">允许</Tag> : <Tag color="error">禁止</Tag>} />
                            <Column title="回复帖子" dataIndex="banReply" key="banReply" align="center" width={90}
                                render={(record, text) => !record ? <Tag color="success">允许</Tag> : <Tag color="error">禁止</Tag>} />
                            <Column title="上传附件" dataIndex="banUploadAttachment" key="banUploadAttachment" align="center" width={90}
                                render={(record, text) => !record ? <Tag color="success">允许</Tag> : <Tag color="error">禁止</Tag>} />
                            <Column title="下载附件" dataIndex="banDownloadAttachment" key="banDownloadAttachment" align="center" width={90}
                                render={(record, text) => !record ? <Tag color="success">允许</Tag> : <Tag color="error">禁止</Tag>} />
                            <Column
                                title="操作"
                                key="action"
                                align="center"
                                width={90}
                                render={(text, record) => (
                                    <>
                                        <span className="btn-option" onClick={() => handleBoardPermissionModalShow('update', record)}>修改</span>
                                    </>
                                )}
                            />
                        </Table>
                }
            </Modal>

            <Modal
                title={boardPermissionModalType === 'insert' ? '新建用户指定板块权限' : '修改用户指定板块权限'}
                visible={boardPermissionModalVisible}
                onCancel={handleBoardPermissionModalCancel}
                maskClosable={false}
                footer={<Button type="primary" onClick={handleBoardPermissionModalConfirm}>确定</Button>}>
                <>
                    {
                        boardPermissionModalType === 'insert'
                            ? <Cascader
                                style={{ width: 200, marginBottom: 24 }}
                                options={boardNameList}
                                fieldNames={boardNameListfieldNames}
                                onChange={value => setBoardSelectId(value)}
                                placeholder="请选择板块名称" />
                            : <div style={{ marginBottom: 24, color: 'rgba(0, 0, 0, 0.85)', fontSize: 14 }}>
                                <div style={{ marginBottom: 24 }}>用户名称：{userInfo.username}</div>
                                <div>板块名称：{boardPermissionInfo.name}</div>
                            </div>
                    }
                    <Form
                        form={boardPermissionForm}
                        initialValues={{
                            banVisit: false, banCreateTopic: false, banReply: false,
                            banUploadAttachment: false, banDownloadAttachment: false
                        }}>

                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="banVisit" label="访问论坛" valuePropName="checked">
                                    <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="banCreateTopic" label="创建帖子" valuePropName="checked">
                                    <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="banReply" label="回复帖子" valuePropName="checked">
                                    <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="banUploadAttachment" label="上传附件" valuePropName="checked">
                                    <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item name="banDownloadAttachment" label="下载附件" valuePropName="checked">
                                    <Switch checkedChildren="禁止" unCheckedChildren="允许" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </>
            </Modal>
        </>
    )
}

export default UserList
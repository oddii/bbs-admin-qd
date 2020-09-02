import React, { useState, useCallback, useEffect } from 'react'
import {
    Card, Tabs, Row, Col, Avatar, Button, Form, Input, Select, List,
    message, Modal, Switch, Table, Tag, Cascader, Upload
} from 'antd'
import { UploadOutlined, EditOutlined } from '@ant-design/icons'
import { useParams, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { getData, postData } from '../../utils/apiMethods'
import userApi from '../../api/user'
import boardApi from '../../api/board'
import { ACTIONS, CONFIG } from '../../constant'

import './index.scss'
const { TabPane } = Tabs
const { Column } = Table

//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

//  安全设置列表数据
const safeSettingsData = [
    {
        key: 'password',
        title: '账户密码',
        description: '******'
    }
]

//  权限设置列表数据
const permissionSettingsData = [
    {
        key: 'admin',
        title: '管理员',
        description: '是否拥有管理员权限'
    }, {
        key: 'superBoardAdmin',
        title: '超级版主',
        description: '是否拥有超级版主权限'
    }, {
        key: 'forumPermission',
        title: '论坛权限',
        description: '控制用户论坛权限'
    }, {
        key: 'boardPermission',
        title: '板块权限',
        description: '控制用户指定板块权限'
    }
]

/**
 * 上传文件前校验事件
 * @param {上传文件}} file 
 */
const beforeUpload = file => {
    const isJpgOrPngOrGif = file.type === 'image/jpeg'
        || file.type === 'image/png' || file.type === 'image/gif'
    if (!isJpgOrPngOrGif) {
        message.error('请上传 jpg/png/gif 类型的图片！')
        return false
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('上传文件大小不能超过2MB！');
        return false
    }

    return true
}

//  上传组件参数
const uploadProps = {
    name: 'file',
    action: userApi.updateUserAvatar,
    withCredentials: true,
    showUploadList: false,
    beforeUpload
}


function Settings() {

    const { id } = useParams() // 用户 Id

    const history = useHistory()
    const dispatch = useDispatch()

    const [userInfo, setUserInfo] = useState({})
    const localUserInfo = useSelector(state => state.userReducer)
    const [userAvatarPath, setUserAvatarPath] = useState('')

    const [baseSetttingsForm] = Form.useForm()

    const [passwordUpdateForm] = Form.useForm()
    const [passwordUpdateModalVisible, setPasswordUpdateModalVisible] = useState(false)

    const [permissionModalVisible, setPermissionModalVisible] = useState(false)
    const [permissionModalType, setPermissionModalType] = useState('')
    const [forumPermissionForm] = Form.useForm()

    const [boardSelectId, setBoardSelectId] = useState(0)
    const [boardNameList, setBoardNameList] = useState([])
    const [boardPermissionInfo, setBoardPermissionInfo] = useState(false)
    const [boardPermissionModalVisible, setBoardPermissionModalVisible] = useState(false)
    const [boardPermissionModalType, setBoardPermissionModalType] = useState('')
    const [boardPermissionForm] = Form.useForm()

    /**
     * 获取用户信息
     */
    const getUserInfo = useCallback(id => {
        if (!id) {
            message.error('您尚未登录，请先登录再继续操作')
            return history.push('/login')
        } else if (!localUserInfo.admin) {
            message.error('您尚未获得访问该页面的权限！')
            return history.goBack()
        } else {
            getData(userApi.getUserList, { userId: id, page: 1, count: 1 }).then(async result => {
                const { code, data, msg } = await result.data
                if (code !== 200) return message.error(msg)
                const { content } = data

                const userId = localStorage.getItem('userId')
                userId === id && dispatch({ type: ACTIONS.SET_USER_DATA, user: content[0] })

                setUserInfo(content[0])
                setUserAvatarPath(CONFIG.baseUrl + content[0].avatarPath.substring(1, content[0].avatarPath.length))
                baseSetttingsForm.setFieldsValue(content[0])
            })
        }
    }, [localUserInfo.admin, history, dispatch, baseSetttingsForm])

    const handlePasswordUpdateModalShow = () => {
        passwordUpdateForm.setFieldsValue({ password: '', confirmPassword: '' })
        setPasswordUpdateModalVisible(true)
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

    const handlePasswordUpdateModalConfirm = () => {
        passwordUpdateForm.validateFields(['password', 'confirmPassword'])
            .then(result => {
                const { password, confirmPassword } = result
                if (password !== confirmPassword) {
                    return message.error('两次输入密码不一致，请重新输入！')
                }

                postData(userApi.updateUserInfo, {
                    id: userInfo.id,
                    password,
                    username: userInfo.username,
                    admin: userInfo.admin,
                    superBoardAdmin: userInfo.superBoardAdmin,
                    nickname: userInfo.nickname,
                    email: userInfo.email,
                    sex: userInfo.sex,
                    signature: userInfo.signature
                }).then(result => {
                    const { code, msg } = result.data
                    if (code !== 200) return message.error(msg)
                    getUserInfo(id)
                    message.success('修改成功！')
                    setPasswordUpdateModalVisible(false)
                })
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    /**
     * 安全列表项点击事件
     * @param {列表项} item 
     */
    const handleSafeListOnClick = item => {
        const { key } = item
        switch (key) {
            case 'password':
                handlePasswordUpdateModalShow()
                break
            default:
                break
        }
    }

    /**
     * 权限列表项开关切换事件
     * @param {列表项} item 
     */
    const handlePermisionListOnChange = (item, checked) => {
        const { key } = item
        switch (key) {
            case 'admin':
                postData(userApi.updateUserInfo, {
                    id: userInfo.id,
                    username: userInfo.username,
                    admin: checked,
                    superBoardAdmin: userInfo.superBoardAdmin,
                    nickname: userInfo.nickname,
                    email: userInfo.email,
                    sex: userInfo.sex,
                    signature: userInfo.signature
                }).then(result => {
                    const { code, msg } = result.data
                    if (code !== 200) return message.error(msg)
                    getUserInfo(id)
                    message.success('修改成功！')
                    setPasswordUpdateModalVisible(false)
                })
                break
            case 'superBoardAdmin':
                postData(userApi.updateUserInfo, {
                    id: userInfo.id,
                    username: userInfo.username,
                    admin: userInfo.admin,
                    superBoardAdmin: checked,
                    nickname: userInfo.nickname,
                    email: userInfo.email,
                    sex: userInfo.sex,
                    signature: userInfo.signature
                }).then(result => {
                    const { code, msg } = result.data
                    if (code !== 200) return message.error(msg)
                    getUserInfo(id)
                    message.success('修改成功！')
                    setPasswordUpdateModalVisible(false)
                })
                break
            default:
                break
        }
    }

    /**
     * 权限列表项点击事件
     * @param {列表项} item 
     */
    const handlePermissionListOnClick = item => {
        const { key } = item
        switch (key) {
            case 'forumPermission':
                handlePermissionModalShow('forum')
                break
            case 'boardPermission':
                handlePermissionModalShow('board')
                break
            default:
                break
        }
    }

    /**
     * 基本信息更改提交事件
     * @param {表单信息} values 
     */
    const handleBaseInfoOnFinish = values => {
        const { nickname, email, sex, signature } = values
        postData(userApi.updateUserInfo, {
            id: userInfo.id,
            username: userInfo.username,
            admin: userInfo.admin,
            superBoardAdmin: userInfo.superBoardAdmin,
            nickname,
            email,
            sex,
            signature
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success('修改成功！')
        })
    }

    /**
     * 基本信息更改提交失败事件
     * @param {表单信息验证错误返回参数} params
     */
    const handleBaseInfoOnFinishFailed = ({ errorFields }) => {
        const { errors } = errorFields[0]
        return message.error(errors[0])
    }

    /**
     * 根据 type 打开修改用户论坛权限/指定板块权限 Modal 事件
     * @param {用户信息} item 
     * @param {Modal 类型} type 
     */
    const handlePermissionModalShow = (type) => {
        type === 'forum' && forumPermissionForm.setFieldsValue(userInfo.forumPermission)
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
                getUserInfo(id)
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
                getUserInfo(id)
                boardPermissionModalType === 'insert'
                    ? message.success('新建用户指定板块权限成功！')
                    : message.success('修改用户指定板块权限成功！')
                setBoardPermissionModalVisible(false)
            })
        })
    }

    /**
     * 图片上传完成
     */
    const handleImageUploadFinish = ({ file }) => {
        const { response, status } = file
        if (status === 'done') {
            const { code, msg } = response
            if (code !== 200) return message.error(msg)
            getUserInfo(id)
            return message.success('修改成功！')
        }
    }

    useEffect(() => {
        getUserInfo(id)
    }, [getUserInfo, id])

    return (
        <>
            <Card
                className="user-settings-wrapper"
                title="用户设置">
                <Tabs
                    tabPosition="left">
                    <TabPane tab="基本设置" key="1">
                        <Row gutter={16}>
                            {/* 左侧修改基本信息 */}
                            <Col flex="0 1 326px" className="user-meta-wrapper">
                                <Form
                                    form={baseSetttingsForm}
                                    layout="vertical"
                                    hideRequiredMark
                                    onFinish={handleBaseInfoOnFinish}
                                    onFinishFailed={handleBaseInfoOnFinishFailed}
                                >
                                    <Form.Item
                                        label="昵称"
                                        name="nickname"
                                        rules={[{ required: true, message: '请输入用户昵称！' },
                                        { type: 'string', max: 30, message: '用户昵称需要在1和30之间！' }]}
                                    >
                                        <Input placeholder="请输入用户昵称" />
                                    </Form.Item>

                                    <Form.Item
                                        label="邮箱"
                                        name="email"
                                        rules={[{ required: true, message: '请输入邮箱地址！' },
                                        { type: 'email', message: '请输入合法的邮箱地址！' }]}
                                    >
                                        <Input placeholder="请输入邮箱地址" />
                                    </Form.Item>

                                    <Form.Item label="性别" name="sex"
                                        rules={[{ required: true, message: '请输入用户性别！' }]}>
                                        <Select style={{ width: '140px' }} placeholder="请输入用户性别">
                                            <Select.Option value={0}>男</Select.Option>
                                            <Select.Option value={1}>女</Select.Option>
                                            <Select.Option value={2}>保密</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        label="个性签名"
                                        name="signature"
                                        rules={[{ type: 'string', max: 500, message: '个性签名不能超过500个字符！' }]}
                                    >
                                        <Input.TextArea rows={3} placeholder="请输入个性签名" />
                                    </Form.Item>

                                    <Form.Item >
                                        <Button type="primary" htmlType="submit" icon={<EditOutlined />}>
                                            更新设置
                                    </Button>
                                    </Form.Item>
                                </Form>
                            </Col>

                            {/* 右侧修改头像 */}
                            <Col flex="1" className="user-avatar-wrapper">
                                <div className="user-avatar-title">头像</div>
                                <div className="user-avatar-container">
                                    <Avatar
                                        className="user-avatar"
                                        src={userInfo.avatarPath
                                            ? CONFIG.baseUrl + userInfo.avatarPath.substring(1, userInfo.avatarPath.length)
                                            : null}
                                    />
                                    {
                                        localUserInfo.admin
                                            ? <Upload {...uploadProps} onChange={handleImageUploadFinish}>
                                                <Button icon={<UploadOutlined />} style={{ marginLeft: '16px' }}>更换头像</Button>
                                            </Upload>
                                            : null
                                    }
                                </div>

                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tab="安全设置" key="2">
                        <div className="user-safe-wrapper">
                            <List
                                itemLayout="horizontal"
                                dataSource={safeSettingsData}
                                renderItem={item => (
                                    <List.Item
                                        actions={[<Button type="link" onClick={() => handleSafeListOnClick(item)}>修改</Button>]}>
                                        <List.Item.Meta
                                            title={item.title}
                                            description={item.description}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </TabPane>

                    <TabPane tab="权限设置" key="3">
                        <div className="user-permission-wrapper">
                            <List
                                itemLayout="horizontal"
                                dataSource={permissionSettingsData}
                                renderItem={(item, index) => (
                                    <List.Item
                                        actions={
                                            index === 0 || index === 1
                                                ? [<Switch
                                                    disabled={id == localUserInfo.id}
                                                    onChange={(checked) => handlePermisionListOnChange(item, checked)}
                                                    defaultChecked={userInfo[item.key]}
                                                    checkedChildren="是" unCheckedChildren="否" />]
                                                : [<Button type="link" onClick={() => handlePermissionListOnClick(item)}>修改</Button>]}>
                                        <List.Item.Meta
                                            title={item.title}
                                            description={item.description}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title='修改用户密码'
                visible={passwordUpdateModalVisible}
                maskClosable={false}
                onCancel={() => setPasswordUpdateModalVisible(false)}
                footer={<Button type="primary" onClick={handlePasswordUpdateModalConfirm}>确定</Button>}
            >
                <Form
                    form={passwordUpdateForm}
                    hideRequiredMark>

                    <Form.Item
                        name="password"
                        label="新的密码"
                        rules={[{ required: true, message: '请输入新的密码！' },
                        { min: 6, max: 20, message: '用户密码需要在6和20之间！' }]}
                    >
                        <Input.Password placeholder="请输入新密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="确认密码"
                        rules={[{ required: true, message: '请输入确认密码！' },
                        { min: 6, max: 20, message: '确认密码需要在6和20之间！' }]}
                    >
                        <Input.Password placeholder="请输入确认密码" />
                    </Form.Item>
                </Form>
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

export default Settings
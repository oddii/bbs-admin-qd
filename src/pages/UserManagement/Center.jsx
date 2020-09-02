import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Card, Col, Row, Avatar, Tabs, List, Space, Tag, Button, message,
    Badge, Tooltip, Popconfirm, Modal, Cascader, Select, Drawer,
    Form, InputNumber, Input
} from 'antd'
import {
    CloudOutlined, MessageOutlined, EditOutlined,
    DeleteOutlined, PlusOutlined
} from '@ant-design/icons'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { getData, postData } from '../../utils/apiMethods'
import userApi from '../../api/user'
import topicApi from '../../api/topic'
import replyApi from '../../api/reply'
import categoryApi from '../../api/category'
import boardApi from '../../api/board'
import { ACTIONS, CONFIG } from '../../constant'
import './index.scss'

const { TabPane } = Tabs;
const { Option } = Select

const IconText = ({ icon, text }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

function Center() {

    const { id } = useParams() // 用户 Id

    const history = useHistory()
    const dispatch = useDispatch()
    const [userInfo, setUserInfo] = useState({})
    const localUserInfo = useSelector(state => state.userReducer)
    let [boardAdminLen, setBoardAdminLen] = useState(0)
    let [categoryAdminLen, setCategoryAdminLen] = useState(0)

    const [topicList, setTopicList] = useState([])
    const [topicListCurrentPage, setTopicListCurrentPage] = useState(1)
    const [topicListPageSize, setTopicListPageSize] = useState(10)
    const [topicListTotal, setTopicListTotal] = useState(0)
    const [replyList, setReplyList] = useState([])
    const [replyListCurrentPage, setReplyListCurrentPage] = useState(1)
    const [replyListPageSize, setReplyListPageSize] = useState(10)
    const [replyListTotal, setReplyListTotal] = useState(0)

    const [tabsActiveKey, setTabsActiveKey] = useState('1')

    const [adminInsertModalVisible, setAdminInsertModalVisible] = useState(false)
    const [adminInsertModalType, setAdminInsertModalType] = useState('')
    const [boardNameList, setBoardNameList] = useState([])
    const [categoryNameList, setCategoryNameList] = useState([])
    const [boardSelectId, setBoardSelectId] = useState(0)
    const [categorySelectId, setCategorySelectId] = useState(0)

    const [categoryForm] = Form.useForm()
    const [boardForm] = Form.useForm()
    const [categoryDrawerVisible, setCategoryDrawerVisible] = useState(false)
    const [boardDrawerVisible, setBoardDrawerVisible] = useState(false)
    const [categoryInfo, setCategoryInfo] = useState({})
    const [boardInfo, setBoardInfo] = useState({})

    /**
     * Tabs 组件头部右侧组件
     */
    const TabsOperationsSlot = {
        1: null,
        2: null,
        3: <Button type="link" icon={<PlusOutlined />}
            onClick={() => handleAdminInsertModalShow('board')}>
            添加管理板块</Button>,
        4: <Button type="link" icon={<PlusOutlined />}
            onClick={() => handleAdminInsertModalShow('category')}>
            添加管理分区</Button>
    }

    /**
     * Tabs 组件头部右侧组件动态改变事件
     */
    const slot = useMemo(() => {
        return TabsOperationsSlot[tabsActiveKey]
    }, [TabsOperationsSlot, tabsActiveKey])

    /**
     * 获取用户信息
     */
    const getUserInfo = useCallback(id => {

        if (!id) {
            message.error('您尚未登录，请先登录再继续操作！')
            return history.push('/login')
        } else if (localUserInfo.id != id && !localUserInfo.admin) {
            message.error('您尚未获得访问他人用户中心页权限！')
            return history.goBack()

        } else {
            getData(userApi.getUserList, { userId: id, page: 1, count: 1 }).then(async result => {
                const { code, data, msg } = await result.data
                const { content } = data
                if (code !== 200) return message.error(msg)

                const userId = localStorage.getItem('userId')
                userId === id && dispatch({ type: ACTIONS.SET_USER_DATA, user: content[0] })

                setUserInfo(content[0])
                setBoardAdminLen(content[0].boardAdmin.length)
                setCategoryAdminLen(content[0].categoryAdmin.length)

                getTopicList({
                    username: content[0].username,
                    count: topicListPageSize,
                    page: topicListCurrentPage
                })

                getReplyList({
                    username: content[0].username,
                    count: topicListPageSize,
                    page: topicListCurrentPage
                })
            }).catch(() => {
                message.error('服务器出现错误，请稍后再试')
            })
        }
    }, [dispatch, history, localUserInfo.admin, localUserInfo.id, topicListCurrentPage, topicListPageSize])

    /**
     * 获取指定用户的主题帖列表
     * @param {用户id} userId 
     * @param {主题帖类型} type 默认为 normal
     * normal=>普通主题+精华主题，featured=>精华主题，pinned=>置顶主题，announcement=>公告主题
     * @param {排序方式} sort 默认为 replyTime
     * replyTime=>最后回复时间，submitTime=>发帖时间，viewCount=>浏览次数，replyCount=>回复数
     * @param {页码} page 
     * @param {页面大小} count 上限20
     */
    const getTopicList = (params = {}) => {
        getData(topicApi.getTopicList, params).then(result => {
            let { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            data.content = data.content.map(item => {
                return Object.assign(item, {
                    description:
                        (item.type === 0 ? <Tag color="blue">普通帖子</Tag> : <Tag>公告</Tag>),
                    content:
                        (<>
                            <div>{item.shortContent}</div>
                            <div>
                                发布在<Button type="link">{item.boardName}</Button>板块，
                                <Button type="link">{item.categoryName}</Button>分区，<span>{item.submitTime}</span>
                            </div>
                        </>)
                })
            })
            setTopicList(data.content)
            setTopicListCurrentPage(data.currentPage)
            setTopicListPageSize(data.pageSize)
            setTopicListTotal(data.totalRecords)
        })
    }

    /**
     * 获取指定用户的回复帖列表
     * @param {用户id} userId 
     * @param {页码} page 
     * @param {页面大小} count 上限20
     */
    const getReplyList = (params = {}) => {
        getData(replyApi.getReplyList, params).then(result => {
            let { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            data.content = data.content.map(item => {
                return Object.assign(item, {
                    content:
                        (<>
                            <div className="replyed-content">
                                回贴内容：{
                                    item.shortContent
                                        ? item.shortContent
                                        : item.content
                                }
                                <div className="border-topleft"></div>
                                <div className="border-topleft2"></div>
                                <div className="border-bottomright"></div>
                                <div className="border-bottomright2"></div>
                            </div>
                            {/* <div className="reply-content">回贴内容：{
                                item.shortContent
                                    ? item.shortContent
                                    : item.content
                            }</div> */}
                            <div style={{ marginTop: 8 }}>回复时间：{item.replyTime}</div>
                        </>)
                })
            })
            setReplyList(data.content)
            setReplyListCurrentPage(data.currentPage)
            setReplyListPageSize(data.pageSize)
            setReplyListTotal(data.totalRecords)
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

    const handleToTopicItemInfo = id => {
        history.push(`/admin/topic/id/${id}`)
    }

    const handleToUserItemInfo = () => {
        history.push(`/admin/user/settings/${id}`)
    }

    /**
     * 根据 type 打开添加版主/分区版主 Modal 事件
     * @param {用户信息} item 
     * @param {Modal 类型} type 
     */
    const handleAdminInsertModalShow = (type) => {
        type === 'board' ? getBoardNameList() : getCategoryNameList()
        setAdminInsertModalType(type)
        setAdminInsertModalVisible(true)
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
                getUserInfo(id)
                message.success('添加管理板块成功！')
            })

        } else if (adminInsertModalType === 'category') {
            if (categorySelectId) return message.error('请选择管理分区')
            let categoryIdList = userInfo.categoryAdmin.map(item => item.id).concat(categorySelectId)
            postData(userApi.updateCategoryAdmin, {
                userId: userInfo.id,
                categoryIdList
            }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                setAdminInsertModalVisible(false)
                getUserInfo(id)
                message.success('添加管理分区成功！')
            })

        }
    }

    /**
     * 
     * @param {用户信息} userInfo 
     * @param {点击项} item 
     */
    const handleBoardAdminDelete = (item) => {
        let boardIdList = userInfo.boardAdmin.map(item => item.id).filter(boardId => item.id !== boardId)
        postData(userApi.updateBoardAdmin, {
            userId: userInfo.id,
            boardIdList
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            getUserInfo(id)
            message.success('移除管理板块成功！')
        })
    }

    /**
     * 
     * @param {用户信息} userInfo 
     * @param {点击项} item 
     */
    const handleCategoryAdminDelete = (item) => {
        let categoryIdList = userInfo.categoryAdmin.map(item => item.id).filter(categoryId => item.id !== categoryId)
        postData(userApi.updateCategoryAdmin, {
            userId: userInfo.id,
            categoryIdList
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            getUserInfo(id)
            message.success('移除管理分区成功！')
        })
    }

    const handleBoardDrawerShow = item => {
        setBoardInfo(item)
        boardForm.setFieldsValue(item)
        setBoardDrawerVisible(true)
    }

    const handleBoardDrawerCancel = () => {
        setBoardDrawerVisible(false)
    }

    const handleBoardDrawerConfirm = () => {
        boardForm.validateFields(['name', 'description', 'visible', 'order', 'categoryId', 'banVisit',
            'banCreateTopic', 'banReply', 'banUploadAttachment', 'banDownloadAttachment'])
            .then(result => {
                const { name, description, visible, order, categoryId, banVisit, banCreateTopic,
                    banReply, banUploadAttachment, banDownloadAttachment } = result

                const boardPermission = {
                    banVisit,
                    banCreateTopic,
                    banReply,
                    banUploadAttachment,
                    banDownloadAttachment
                }

                const data = {
                    name,
                    description,
                    visible,
                    order,
                    categoryId,
                    boardPermission
                }
                postData(boardApi.updateBoard, { id: boardInfo.id, ...data }).then(result => {
                    const { code, msg } = result.data
                    if (code !== 200) return message.error(msg)
                    message.success('编辑成功！')
                    getUserInfo(id)
                    handleBoardDrawerCancel()
                })
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    const handleCategoryDrawerShow = item => {
        setCategoryInfo(item)
        categoryForm.setFieldsValue(item)
        setCategoryDrawerVisible(true)
    }

    const handleCategoryDrawerCancel = () => {
        setCategoryDrawerVisible(false)
    }

    const handleCategoryDrawerConfirm = () => {
        categoryForm.validateFields(['name', 'description', 'visible', 'order'])
            .then(result => {
                postData(categoryApi.updateCategory, { id: categoryInfo.id, ...result }).then(result => {
                    const { code, msg } = result.data
                    if (code !== 200) return message.error(msg)
                    message.success('编辑成功！')
                    getUserInfo(id)
                    handleCategoryDrawerCancel()
                })
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    const handleTabsActiveKeyChange = key => {
        setTabsActiveKey(key)
    }



    useEffect(() => {
        // const userId = localStorage.getItem('userId')
        getUserInfo(id)
        // getTopicList()
        // getReplyList()
    }, [getUserInfo, id])


    return (
        <>
            <Card
                title="用户中心"
                className="user-center-wrapper"
                extra={
                    localUserInfo.admin
                        ? <Button onClick={handleToUserItemInfo}>修改用户信息</Button>
                        : null}>
                <Row gutter={16}>
                    {/* 左侧 */}
                    <Col flex="0 1 300px" className="user-meta-wrapper">
                        <div className="user-meta">
                            <Avatar
                                className="meta-avatar"
                                src={userInfo.avatarPath
                                    ? CONFIG.baseUrl + userInfo.avatarPath.substring(1, userInfo.avatarPath.length)
                                    : null}
                                size={120} />
                            <div className="meta-username">{userInfo.username}</div>
                            <div className="meta-role">
                                {
                                    userInfo.admin
                                        ? <Badge status="processing" text="管理员" style={{ padding: '0 5px' }} />
                                        : <></>
                                }
                                {
                                    userInfo.superBoardAdmin
                                        ? <Badge status="success" text="超级版主" style={{ padding: '0 5px' }} />
                                        : <></>
                                }
                            </div>
                            <div className="meta-nickname">{userInfo.nickname}</div>
                            <div className="meta-signature">
                                个性签名：{userInfo.signature ? userInfo.signature : '这家伙很懒，什么都没留下来...'}
                            </div>
                            <div className="meta-email-wrapper">
                                <div className="meta-email">
                                    <Tooltip title={userInfo.email}>
                                        {userInfo.email}
                                    </Tooltip>
                                </div>
                                {
                                    userInfo.emailVerified
                                        ? <Tag color="success">已激活</Tag>
                                        : <Tag color="error">未激活</Tag>
                                }
                            </div>
                            <div className="meta-sex">
                                {
                                    userInfo.sex === 0
                                        ? <Badge status="processing" text="男生" />
                                        : userInfo.sex === 1
                                            ? <Badge status="error" text="女生" />
                                            : <Badge status="default" text="保密" />
                                }
                            </div>
                            <div className="meta-registerTime">注册时间：{userInfo.registerTime}</div>
                        </div>
                    </Col>

                    {/* 右侧 */}
                    <Col flex="1" className="user-extend-wrapper">
                        <Tabs
                            defaultActiveKey="1"
                            onChange={handleTabsActiveKeyChange}
                            tabBarExtraContent={localUserInfo.admin ? slot : null}>

                            <TabPane
                                tab={<div>我的主题 <span className="meta-count">{topicListTotal}</span></div>}
                                key="1" >
                                <List
                                    itemLayout="vertical"
                                    size="large"
                                    dataSource={topicList}
                                    pagination={{
                                        current: topicListCurrentPage,
                                        pageSize: topicListPageSize,
                                        total: topicListTotal,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total) => `Total ${total} items`,
                                        onChange: (currentPage, pageSize) => getTopicList({
                                            username: userInfo.username,
                                            page: currentPage,
                                            count: pageSize
                                        })
                                    }}
                                    renderItem={item => (
                                        <List.Item
                                            key={item.id}
                                            actions={[
                                                <IconText icon={CloudOutlined} text={'浏览：' + item.viewCount} key="item-viewCount" />,
                                                <IconText icon={MessageOutlined} text={'回复：' + item.replyCount} key="item-replyCount" />,
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<div
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleToTopicItemInfo(item.id)}>
                                                    {item.title}
                                                </div>}
                                                description={item.description}
                                            />
                                            {item.content}
                                        </List.Item>
                                    )}
                                />

                            </TabPane>

                            <TabPane
                                tab={<div>我的回复 <span className="meta-count">{replyListTotal}</span></div>}
                                key="2">
                                <List
                                    itemLayout="vertical"
                                    size="large"
                                    dataSource={replyList}
                                    pagination={{
                                        current: replyListCurrentPage,
                                        pageSize: replyListPageSize,
                                        total: replyListTotal,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total) => `Total ${total} items`,
                                        onChange: (currentPage, pageSize) => getReplyList({
                                            username: userInfo.username,
                                            page: currentPage,
                                            count: pageSize
                                        })
                                    }}
                                    renderItem={item => (
                                        <List.Item
                                            key={item.id}
                                        >
                                            <List.Item.Meta
                                                style={{ marginBottom: 8 }}
                                                title={<div
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => handleToTopicItemInfo(item.topicId)}>
                                                    {item.topicTitle}
                                                </div>}
                                            />
                                            {item.content}
                                        </List.Item>
                                    )}
                                />
                            </TabPane>

                            <TabPane
                                tab={<div>管理板块 <span className="meta-count">{boardAdminLen}</span></div>}
                                key="3">
                                <List
                                    grid={{ gutter: 16, column: 4 }}
                                    dataSource={userInfo.boardAdmin}
                                    renderItem={(item => (
                                        <List.Item>
                                            <Card
                                                actions={localUserInfo.admin
                                                    ? [
                                                        <div onClick={() => handleBoardDrawerShow(item)}>
                                                            <EditOutlined key="edit" /> 编辑</div>,
                                                        <Popconfirm
                                                            title="删除后不可恢复，您确认删除本项吗？"
                                                            onConfirm={() => handleBoardAdminDelete(item)}
                                                            okText="是的！"
                                                            cancelText="我再想想..."
                                                        >
                                                            <div><DeleteOutlined key="delete" /> 删除</div>
                                                        </Popconfirm>
                                                    ]
                                                    : null}>
                                                <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                                                <div>板块编号：{item.id}</div>
                                            </Card>
                                        </List.Item>
                                    ))}
                                />
                            </TabPane>

                            <TabPane
                                tab={<div>管理分区 <span className="meta-count">{categoryAdminLen}</span></div>}
                                key="4">
                                <List
                                    grid={{ gutter: 16, column: 4 }}
                                    dataSource={userInfo.categoryAdmin}
                                    renderItem={item => (
                                        <List.Item>
                                            <Card
                                                actions={localUserInfo.admin
                                                    ? [
                                                        <div onClick={() => handleCategoryDrawerShow(item)}>
                                                            <EditOutlined key="edit" /> 编辑</div>,
                                                        <Popconfirm
                                                            title="删除后不可恢复，您确认删除本项吗？"
                                                            onConfirm={() => handleCategoryAdminDelete(item)}
                                                            okText="是的！"
                                                            cancelText="我再想想..."
                                                        >
                                                            <div><DeleteOutlined key="delete" /> 删除</div>
                                                        </Popconfirm>
                                                    ]
                                                    : null}>
                                                <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                                                <div>分区编号：{item.id}</div>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </Card>

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

            <Drawer
                title='修改板块'
                width={400}
                onClose={handleBoardDrawerCancel}
                visible={boardDrawerVisible}
                maskClosable={false}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleBoardDrawerCancel} style={{ marginRight: 8 }}>取消</Button>
                        <Button type="primary" onClick={handleBoardDrawerConfirm}>提交</Button>
                    </div>
                }>

                <Form
                    form={boardForm}
                    initialValues={{ order: 1 }}
                    hideRequiredMark
                >
                    <Form.Item
                        name="name"
                        label="板块名称"
                        rules={[{ required: true, message: '请输入板块名称!' },
                        { type: 'string', max: 30, message: '板块名称不能超过30个字符！' }]}
                    >
                        <Input placeholder="请输入板块名称" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="板块描述"
                        rules={[{ required: true, message: '请输入板块描述!' },
                        { type: 'string', max: 200, message: '板块描述不能超过200个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入板块描述" autoSize={{ minRows: 2, maxRows: 6 }} />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="所属分区"
                        rules={[{ required: true, message: '请选择所属分区!' }]}>
                        <Select>
                            {
                                categoryNameList.map(item =>
                                    <Option value={item.id} key={item.id}>{item.name}</Option>)
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="visible"
                        label="是否显示"
                        rules={[{ required: true, message: '请选择是否显示!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '显示', value: true }, { label: '隐藏', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="显示顺序"
                        rules={[{ required: true, message: '请输入显示顺序!' }]}
                    >
                        <InputNumber min={1} max={100} />
                    </Form.Item>

                    <Form.Item
                        name="banVisit"
                        label="是否允许普通会员访问"
                        rules={[{ required: true, message: '请选择是否允许普通会员访问!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '允许', value: true }, { label: '禁止', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="banCreateTopic"
                        label="是否允许普通会员创建主题帖"
                        rules={[{ required: true, message: '请选择是否允许普通会员创建主题帖!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '允许', value: true }, { label: '禁止', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="banReply"
                        label="是否允许普通会员回复"
                        rules={[{ required: true, message: '请选择是否允许普通会员回复!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '允许', value: true }, { label: '禁止', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="banUploadAttachment"
                        label="是否允许普通会员上传附件"
                        rules={[{ required: true, message: '请选择是否允许普通会员上传附件!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '允许', value: true }, { label: '禁止', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="banDownloadAttachment"
                        label="是否允许普通会员下载附件"
                        rules={[{ required: true, message: '请选择是否允许普通会员下载附件!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '允许', value: true }, { label: '禁止', value: false }]} />
                    </Form.Item>
                </Form>
            </Drawer>

            <Drawer
                title='修改分区'
                width={400}
                onClose={handleCategoryDrawerCancel}
                visible={categoryDrawerVisible}
                maskClosable={false}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCategoryDrawerCancel} style={{ marginRight: 8 }}>取消</Button>
                        <Button type="primary" onClick={handleCategoryDrawerConfirm}>提交</Button>
                    </div>
                }>

                <Form
                    form={categoryForm}
                    initialValues={{ order: 1, visible: true }}
                    hideRequiredMark
                >
                    <Form.Item
                        name="name"
                        label="分区名称"
                        rules={[{ required: true, message: '请输入分区名称!' },
                        { type: 'string', max: 30, message: '分区名称不能超过200个字符！' }]}
                    >
                        <Input placeholder="请输入分区名称" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="分区描述"
                        rules={[{ required: true, message: '请输入分区描述!' },
                        { type: 'string', max: 200, message: '分区描述不能超过200个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入分区描述" autoSize={{ minRows: 2, maxRows: 6 }} />
                    </Form.Item>

                    <Form.Item
                        name="visible"
                        label="是否显示"
                        rules={[{ required: true, message: '请选择是否显示!' }]}
                    >
                        <Select
                            style={{ width: '88px' }}
                            options={[{ label: '显示', value: true }, { label: '隐藏', value: false }]} />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="显示顺序"
                        rules={[{ required: true, message: '请输入显示顺序!' }]}
                    >
                        <InputNumber min={1} max={100} />
                    </Form.Item>
                </Form>
            </Drawer>
        </>

    )
}

export default Center
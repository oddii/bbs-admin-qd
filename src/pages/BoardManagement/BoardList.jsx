import React, { useState, useEffect } from 'react'
import {
    Card, Table, Divider, Button, Badge, Drawer, Dropdown, Menu,
    Form, Select, InputNumber, Input, message, Popconfirm,
    Modal, List, Avatar
} from 'antd'

import { DRAWER_TYPE } from '../../constant'
import boardApi from '../../api/board'
import { getData } from '../../utils/apiMethods'

const { Column } = Table;

function BoardList() {

    const [modalVisible, setModalVisible] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [boardList, setBoardList] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(0)
    const [total, setTotal] = useState(0)
    const [boardInfo, setBoardInfo] = useState({})
    const [drawerType, setDrawerType] = useState('')
    const [boardForm] = Form.useForm()

    const getBoardList = (
        page = 1,
        count = 10
    ) => {
        getData(boardApi.getBoardList, {
            page, count
        }).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            setBoardList(data.list)
            setCurrentPage(data.page)
            setPageSize(data.count)
            setTotal(data.total)
        })
    }

    const handleModalShow = item => {
        setBoardInfo(item)
        setModalVisible(true)
    }

    const setFormInitValues = (drawerType, initValues) => {
        setDrawerType(drawerType)
        setBoardInfo(initValues)
        boardForm.setFieldsValue(initValues)
        setDrawerVisible(true)
    }

    const handleItemInsert = () => {
        setFormInitValues(DRAWER_TYPE.INSERT, {
            name: '',
            description: '',
            order: 1,
            visible: true,
            banVisit: true,
            banCreateTopic: true,
            banReply: true,
            banUploadAttachment: true,
            banDownloadAttachment: true,
        })
    }

    const handleItemUpdate = item => {
        setFormInitValues(DRAWER_TYPE.UPDATE, Object.assign(item, { ...item.boardPermission }))
    }

    const handleItemDelete = item => {
        console.log(item);
        message.success(`成功删除名称为 “${item.name}” 的板块！`)
    }

    const handleDrawerCancel = () => {
        setDrawerVisible(false)
    }

    const handleDrawerConfirm = () => {
        boardForm.validateFields(['name', 'description', 'visible', 'order'])
            .then(result => {
                console.log(result);
                console.log(boardInfo)
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    useEffect(() => {
        getBoardList()
    }, [])

    return (
        <>
            <Card
                title="板块列表"
                extra={<Button onClick={handleItemInsert}>新建板块</Button>}>

                <Table
                    rowKey="id"
                    dataSource={boardList}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`,
                        onChange: (currentPage, pageSize) => getBoardList(currentPage, pageSize)
                    }}>
                    <Column
                        title="#"
                        key="index"
                        align="center"
                        width={65}
                        render={(text, record, index) => index + 1} />
                    <Column title="板块名称" dataIndex="name" key="name" align="center" width={180} ellipsis />
                    <Column title="描述" dataIndex="description" key="description" align="center" ellipsis />
                    <Column title="所属分区" dataIndex="categoryName" key="categoryName" align="center" width={180} ellipsis />
                    <Column
                        title="是否显示"
                        dataIndex="visible"
                        key="visible"
                        align="center"
                        width={120}
                        render={visible => {
                            return visible ? <Badge status="processing" text="显示" title="显示" />
                                : <Badge status="error" text="隐藏" title="隐藏" />
                        }} />
                    <Column title="顺序" dataIndex="order" key="order" align="center" width={65} />
                    <Column title="创建时间" dataIndex="createTime" key="createTime" align="center" width={180} />
                    <Column title="更新时间" dataIndex="updateTime" key="updateTime" align="center" width={180} />
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
                                                <div onClick={() => handleModalShow(record)}>版主</div>
                                            </Menu.Item>

                                            <Menu.Item>
                                                <div onClick={() => handleItemUpdate(record)}>编辑</div>
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
            </Card>

            <Modal
                title={boardInfo.name + ' 的版主列表'}
                visible={modalVisible}
                closable={false}
                maskClosable={false}
                footer={<Button onClick={() => setModalVisible(false)}>关闭</Button>}
            >
                <List
                    dataSource={boardInfo.boardAdmin}

                    renderItem={item => (<List.Item actions={[<Button type="link" danger>删除</Button>]}>
                        <List.Item.Meta
                            avatar={<Avatar style={{ color: '#1890ff', backgroundColor: '#e6f7ff' }}>{item.nickname[0]}</Avatar>}
                            title={item.nickname}
                            description={'板块版主'}
                        /></List.Item>)}
                />
            </Modal>

            <Drawer
                title={drawerType === DRAWER_TYPE.INSERT ? '新建板块' : '修改板块'}
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
        </>
    )
}

export default BoardList
import React, { useState, useEffect } from 'react'
import {
    Card, Table, Divider, Button, Badge, Drawer,
    Form, Input, InputNumber, Select, message, Popconfirm,
    Dropdown, Menu, Modal, List, Avatar
} from 'antd'

import { DRAWER_TYPE } from '../../constant'
import categoryApi from '../../api/category'
import userApi from '../../api/user'
import { getData, postData } from '../../utils/apiMethods'
import { useSelector } from 'react-redux'

const { Column } = Table;

function CategoryList() {

    const localUserInfo = useSelector(state => state.userReducer)

    const [modalVisible, setModalVisible] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const [categoryInfo, setCategoryInfo] = useState({})
    const [drawerType, setDrawerType] = useState('')
    const [categoryForm] = Form.useForm()

    const getCategoryList = (params = {}) => {
        getData(categoryApi.getCategoryList, params).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setCategoryList(data.content)
            setCurrentPage(data.currentPage)
            setPageSize(data.pageSize)
            setTotal(data.totalRecords)
        })
    }

    const setFormInitValues = (drawerType, initValues) => {
        setDrawerType(drawerType)
        setCategoryInfo(initValues)
        categoryForm.setFieldsValue(initValues)
        setDrawerVisible(true)
    }

    const handleModalShow = item => {
        setCategoryInfo(item)
        setModalVisible(true)
    }

    const handleItemInsert = () => {
        setFormInitValues(DRAWER_TYPE.INSERT, {
            name: '',
            description: '',
            order: 1,
            visible: true
        })
    }

    const handleItemUpdate = item => {
        setFormInitValues(DRAWER_TYPE.UPDATE, item)
    }

    const handleItemDelete = item => {
        postData(categoryApi.delCategory, { id: item.id }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success(`成功删除名称为 “${item.name}” 的分区！`)
            getCategoryList({
                page: currentPage,
                count: pageSize
            })
        })
    }

    const handleAdminItemDelete = adminItem => {
        const categoryIdList = categoryInfo.categoryAdmin
            .filter(item => item.id !== adminItem.id)
            .map(item => item.id);

        postData(userApi.updateCategoryAdmin, { categoryIdList }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success(`成功删除名称为 “${adminItem.name}” 的分区版主！`)
            setModalVisible(false)
            getCategoryList({
                page: currentPage,
                count: pageSize
            })
        })
    }

    const handleDrawerCancel = () => {
        setDrawerVisible(false)
    }

    const handleDrawerConfirm = () => {
        categoryForm.validateFields(['name', 'description', 'visible', 'order'])
            .then(result => {
                if (drawerType === DRAWER_TYPE.INSERT) {
                    postData(categoryApi.addCategory, result).then(result => {
                        const { code, msg } = result.data
                        if (code !== 200) return message.error(msg)
                        message.success('新建成功！')
                        getCategoryList({
                            page: currentPage,
                            count: pageSize
                        })
                        handleDrawerCancel()
                    })
                } else if (drawerType === DRAWER_TYPE.UPDATE) {
                    postData(categoryApi.updateCategory, { id: categoryInfo.id, ...result }).then(result => {
                        const { code, msg } = result.data
                        if (code !== 200) return message.error(msg)
                        message.success('编辑成功！')
                        getCategoryList({
                            page: currentPage,
                            count: pageSize
                        })
                        handleDrawerCancel()
                    })
                }
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    useEffect(() => {
        getCategoryList({
            page: currentPage,
            count: pageSize
        })
    }, [currentPage, pageSize])

    return (
        <>
            <Card
                title="分区列表"
                extra={
                    localUserInfo.admin
                        ? <Button onClick={handleItemInsert}>新建分区</Button>
                        : null} >

                <Table
                    rowKey="id"
                    dataSource={categoryList}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`,
                        onChange: (currentPage, pageSize) => getCategoryList({ page: currentPage, count: pageSize })
                    }}>
                    <Column
                        title="#"
                        key="index"
                        width={65}
                        align="center"
                        render={(text, record, index) => index + 1} />
                    <Column title="分区名称" dataIndex="name" key="name" align="center" width={180} ellipsis />
                    <Column title="描述" dataIndex="description" key="description" align="center" ellipsis />
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
                    {
                        localUserInfo.admin
                            ? <Column
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
                                                        <div onClick={() => handleModalShow(record)}>分区版主</div>
                                                    </Menu.Item>

                                                    <Menu.Item style={{ textAlign: 'center' }}>
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
                            : null
                    }
                </Table>
            </Card >

            <Modal
                title={categoryInfo.name + ' 分区的版主列表'}
                visible={modalVisible}
                maskClosable={false}
                closable={false}
                footer={<Button onClick={() => setModalVisible(false)}>关闭</Button>}
            >
                <List
                    dataSource={categoryInfo.categoryAdmin}
                    renderItem={item => (<List.Item actions={
                        [
                            <Popconfirm
                                title="删除后不可恢复，您确认删除本项吗？"
                                onConfirm={() => handleAdminItemDelete(item)}
                                okText="是的！"
                                cancelText="我再想想..."
                            >
                                <Button type="link" danger>删除</Button>
                            </Popconfirm>
                        ]
                    }>
                        <List.Item.Meta
                            avatar={<Avatar style={{ color: '#1890ff', backgroundColor: '#e6f7ff' }}>{item.name[0]}</Avatar>}
                            title={item.name}
                            description={'分区版主'}
                        /></List.Item>)}
                />
            </Modal>

            <Drawer
                title={drawerType === DRAWER_TYPE.INSERT ? '新建分区' : '修改分区'}
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

export default CategoryList
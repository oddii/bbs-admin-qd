import React, { useState, useEffect } from 'react'
import {
    Card, Table, Divider, Button, Badge, Drawer,
    Form, Input, InputNumber, Select, message, Popconfirm,
    Dropdown, Menu, Modal, List, Avatar
} from 'antd'

import { DRAWER_TYPE } from '../../constant'
import categoryApi from '../../api/category'
import { getData } from '../../utils/apiMethods'

const { Column } = Table;

function CategoryList() {

    const [modalVisible, setModalVisible] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(0)
    const [total, setTotal] = useState(0)
    const [categoryInfo, setCategoryInfo] = useState({})
    const [drawerType, setDrawerType] = useState('')
    const [categoryForm] = Form.useForm()

    const getCategoryList = (
        page = 1,
        count = 10
    ) => {
        getData(categoryApi.getCategoryList, {
            page,
            count
        }).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            setCategoryList(data.list)
            setCurrentPage(data.page)
            setPageSize(data.count)
            setTotal(data.total)
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
            order: 1
        })
    }

    const handleItemUpdate = item => {
        setFormInitValues(DRAWER_TYPE.UPDATE, item)
    }

    const handleItemDelete = item => {
        console.log(item);
        message.success(`成功删除名称为 “${item.name}” 的分区！`)
    }

    const handleDrawerCancel = () => {
        setDrawerVisible(false)
    }

    const handleDrawerConfirm = () => {
        categoryForm.validateFields(['name', 'description', 'visible', 'order'])
            .then(result => {
                console.log(result);
                console.log(categoryInfo)
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    useEffect(() => {
        getCategoryList()
    }, [])

    return (
        <>
            <Card
                title="分区列表"
                extra={<Button onClick={handleItemInsert}>新建分区</Button>} >

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
                        onChange: (currentPage, pageSize) => getCategoryList(currentPage, pageSize)
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
                    renderItem={item => (<List.Item actions={[<Button type="link" danger>删除</Button>]}>
                        <List.Item.Meta
                            avatar={<Avatar style={{ color: '#1890ff', backgroundColor: '#e6f7ff' }}>{item.nickname[0]}</Avatar>}
                            title={item.nickname}
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
                    initialValues={{ order: 1 }}
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
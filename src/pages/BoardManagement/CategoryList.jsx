import React, { useState } from 'react'
import { Card, Table, Divider, Button, Badge, Drawer, Form, Input, InputNumber, Select, message, Popconfirm } from 'antd'

import { DRAWER_TYPE } from '../../constant'

const { Column } = Table;

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
        id: i,
        name: `分区${i}`,
        description: `这是一个新的分区${i}`,
        visible: Math.floor(Math.random() * 2),
        order: Math.floor(Math.random() * 100 + 1),
        create_time: new Date().toLocaleString(),
        update_time: new Date().toLocaleString(),
        delete_time: new Date().toLocaleString()
    })
}

function CategoryList() {

    const [drawerVisible, setDrawerVisible] = useState(false)
    const [categoryInfo, setCategoryInfo] = useState({})
    const [drawerType, setDrawerType] = useState('')
    const [categoryForm] = Form.useForm()

    const setFormInitValues = (drawerType, initValues) => {
        setDrawerType(drawerType)
        setCategoryInfo(initValues)
        categoryForm.setFieldsValue(initValues)
        setDrawerVisible(true)
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

    return (
        <>
            <Card
                title="分区列表"
                extra={<Button onClick={handleItemInsert}>新建分区</Button>} >

                <Table
                    rowKey="id"
                    dataSource={data}
                    pagination={{
                        total: 85,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`
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
                            if (visible === 1) return <Badge status="processing" text="显示" title="显示" />
                            else if (visible === 0) return <Badge status="error" text="隐藏" title="隐藏" />
                        }} />
                    <Column title="顺序" dataIndex="order" key="order" align="center" width={65} />
                    <Column title="创建时间" dataIndex="create_time" key="create_time" align="center" width={180} />
                    <Column title="更新时间" dataIndex="update_time" key="update_time" align="center" width={180} />
                    <Column
                        title="操作"
                        key="action"
                        align="center"
                        width={120}
                        render={(text, record) => (
                            <>
                                <span className="btn-option" onClick={() => handleItemUpdate(record)}>修改</span>

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
                            options={[{ label: '显示', value: 1 }, { label: '隐藏', value: 0 }]} />
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
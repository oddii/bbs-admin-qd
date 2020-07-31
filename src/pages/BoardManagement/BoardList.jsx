import React, { useState } from 'react'
import { Card, Table, Divider, Button, Badge, Drawer, Form, Select, InputNumber, Input, message, Popconfirm } from 'antd'

import { DRAWER_TYPE } from '../../constant'

const { Column } = Table;

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
        id: i,
        name: `板块${i}`,
        description: `这是一个新的板块${i}`,
        category: `所属分区${i}`,
        visible: Math.floor(Math.random() * 2),
        order: Math.floor(Math.random() * 256),
        create_time: new Date().toLocaleString(),
        update_time: new Date().toLocaleString(),
        delete_time: new Date().toLocaleString()
    })
}

function BoardList() {

    const [drawerVisible, setDrawerVisible] = useState(false)
    const [boardInfo, setBoardInfo] = useState({})
    const [drawerType, setDrawerType] = useState('')
    const [boardForm] = Form.useForm()

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
            order: 1
        })
    }

    const handleItemUpdate = item => {
        setFormInitValues(DRAWER_TYPE.UPDATE, item)
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


    return (
        <>
            <Card
                title="板块列表"
                extra={<Button onClick={handleItemInsert}>新建板块</Button>}>

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
                        align="center"
                        width={65}
                        render={(text, record, index) => index + 1} />
                    <Column title="板块名称" dataIndex="name" key="name" align="center" width={180} ellipsis />
                    <Column title="描述" dataIndex="description" key="description" align="center" ellipsis />
                    <Column title="所属分区" dataIndex="category" key="category" align="center" width={180} ellipsis/>
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
            </Card>

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

export default BoardList
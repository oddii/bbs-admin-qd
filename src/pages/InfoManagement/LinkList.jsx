import React, { useState } from 'react'
import { Card, List, Button, Popconfirm, message, Drawer, Form, Input } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import './index.scss'
import { DRAWER_TYPE } from '../../constant'

const data = []
for (let i = 0; i < 10; i++) {
  data.push({
    id: i,
    name: `友情链接${i}`,
    url: 'https://ant.design/components/table-cn/',
    logo_url: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
    order: Math.floor(Math.random() * 256),
    description: '这是一条友情链接',
    create_time: new Date().toLocaleString(),
    update_time: new Date().toLocaleString(),
    delete_time: new Date().toLocaleString()
  })
}


function InfoLinkList() {

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerType, setDrawerType] = useState('')
  const [linkInfo, setLinkInfo] = useState({})
  const [linkUpdateForm] = Form.useForm()

  /**
   * 设置表单初始化数值
   * @param {右侧抽屉操作类型} drawerType 
   * @param {初始化数值} initValues 
   */
  const setFormInitValues = (drawerType, initValues) => {
    setDrawerType(drawerType)
    setLinkInfo(initValues)
    linkUpdateForm.setFieldsValue(initValues)
    setDrawerVisible(true)
  }

  /**
   * 点击新增友链按钮事件
   */
  const handleItemInsert = () => {
    setFormInitValues(DRAWER_TYPE.INSERT, {
      name: '',
      url: '',
      logo_url: ''
    })
  }

  /**
   * 点击编辑友链按钮事件
   * @param {点击项友链信息} item 
   */
  const handleItemUpdate = item => {
    setFormInitValues(DRAWER_TYPE.UPDATE, item)
  }

  /**
   * 确认删除友链事件
   * @param {点击项友链信息} item 
   */
  const handleItemDelete = item => {
    message.success(`成功删除名称为 “${item.name}” 的友链！`)
  }

  /**
   * 右侧抽屉取消事件
   */
  const handleDrawerCancel = () => {
    setDrawerVisible(false)
  }

  /**
   * 右侧抽屉提交事件
   */
  const handleDrawerConfirm = () => {
    linkUpdateForm.validateFields(['name', 'url', 'logo_url'])
      .then(result => {
        console.log(drawerType);
        console.log(result);
        console.log(linkInfo);
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
        className="info-link-wrapper"
        title="友链列表"
        extra={<Button onClick={handleItemInsert}>新增友链</Button>}>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4
          }}
          dataSource={data}
          pagination={{
            total: 85,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`
          }}
          renderItem={item => (
            <List.Item>
              <Card
                hoverable
                actions={[
                  <EditOutlined key="edit" onClick={() => handleItemUpdate(item)} />,
                  <Popconfirm
                    title="删除后不可恢复，您确认删除本项吗？"
                    onConfirm={() => handleItemDelete(item)}
                    okText="是的！"
                    cancelText="我再想想..."
                  >
                    <DeleteOutlined key="delete" />
                  </Popconfirm>,
                ]}
              >
                <div className="list-item-wrapper">
                  <div className="item-logo">
                    <img src={item.logo_url} alt="" style={{ width: '48px', height: '48px' }} />
                  </div>
                  <div className="list-item-meta">
                    <div className="item-name">{item.name}</div>
                    <div className="item-url">{item.url}</div>
                    <div className="item-time">创建时间：{item.create_time}</div>
                    <div className="item-time">更新时间：{item.update_time}</div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Drawer
        title={drawerType === DRAWER_TYPE.INSERT ? '新建友情链接' : '修改友情链接'}
        width={400}
        onClose={handleDrawerCancel}
        visible={drawerVisible}
        maskClosable={false}
        footer={
          <div style={{ textAlign: 'right', }}>
            <Button onClick={handleDrawerCancel} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" onClick={handleDrawerConfirm}>提交</Button>
          </div>
        }>

        <Form
          form={linkUpdateForm}
          initialValues={linkInfo}
          hideRequiredMark
        >
          <Form.Item
            name="name"
            label="链接名称"
            rules={[{ required: true, message: '请输入链接名称!' }]}
          >
            <Input placeholder="请输入链接名称" />
          </Form.Item>

          <Form.Item
            name="url"
            label="链接地址"
            rules={[{ required: true, message: '请输入链接地址!' }]}
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>

          <Form.Item
            name="logo_url"
            label="logo地址"
            rules={[{ required: true, message: '请输入logo地址' }]}
          >
            <Input placeholder="请输入logo地址" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  )
}

export default InfoLinkList
import React, { useState } from 'react'
import { Card, List, Button, Popconfirm, message, Drawer, Form, Input, InputNumber } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import './index.scss'
import { DRAWER_TYPE } from '../../constant'
import { getData } from '../../utils/apiMethods'
import linkApi from '../../api/link'
import { useEffect } from 'react'

function InfoLinkList() {

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerType, setDrawerType] = useState('')
  const [linkList, setLinkList] = useState([])
  const [linkInfo, setLinkInfo] = useState({})
  const [linkUpdateForm] = Form.useForm()

  const getLinkList = () => {
    getData(linkApi.getLinkList).then(result => {
      const { code, data } = result.data
      if (code !== 200) return message.error()
      setLinkList(data)
    }).catch(error => {
      console.log(error);
    })
  }

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

  useEffect(() => {
    getLinkList()
  }, [])

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
          dataSource={linkList}
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
                    <img src={item.iconUrl} alt="" style={{ width: '48px', height: '48px' }} />
                  </div>
                  <div className="list-item-meta">
                    <div className="item-name">{item.name}</div>
                    <div className="item-description">{item.description}</div>
                    <div className="item-url">{item.url}</div>
                    <div className="item-time">创建时间：{item.createTime}</div>
                    <div className="item-time">更新时间：{item.updateTime}</div>
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
            name="description"
            label="链接描述"
            rules={[{ required: true, message: '请输入链接描述!' }]}
          >
            <Input placeholder="请输入链接描述" />
          </Form.Item>

          <Form.Item
            name="url"
            label="链接地址"
            rules={[{ required: true, message: '请输入链接地址!' }]}
          >
            <Input placeholder="请输入链接地址" />
          </Form.Item>

          <Form.Item
            name="iconUrl"
            label="logo地址"
            rules={[{ required: true, message: '请输入logo地址' }]}
          >
            <Input placeholder="请输入logo地址" />
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

export default InfoLinkList
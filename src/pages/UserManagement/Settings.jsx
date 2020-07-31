import React from 'react'
import { Card, Tabs, Row, Col, Avatar, Button, Form, Input, Select, List } from 'antd'
import { UploadOutlined, EditOutlined } from '@ant-design/icons'

import './index.scss'
const { TabPane } = Tabs

const data = [
    {
        key: 'password',
        title: '账户密码',
        description: '******'
    },
    {
        key: 'email',
        title: '密保邮箱',
        description: '793523185@qq.com'
    },
    {
        key: 'question',
        title: '密保问题',
        description: '已设置密保问题，密保问题可有效保护账户安全'
    }
];

function Settings() {

    /**
     * 列表项点击事件
     * @param {列表项} item 
     */
    const handleSafeListOnClick = item => {
        console.log(item)
    }

    return (
        <Card
            className="user-settings-wrapper"
            title="个人设置">
            <Tabs
                tabPosition="left">
                <TabPane tab="基本设置" key="1">
                    <Row gutter={16}>
                        {/* 左侧修改基本信息 */}
                        <Col flex="0 1 326px" className="user-meta-wrapper">
                            <Form
                                layout="vertical"
                                hideRequiredMark
                            >
                                <Form.Item
                                    label="昵称"
                                    name="username"
                                    rules={[{ required: true, message: 'Please input your username!' }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    label="邮箱"
                                    name="email"
                                    rules={[{ required: true, message: 'Please input your username!' }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item label="性别">
                                    <Select style={{ width: '140px' }}>
                                        <Select.Option value="0">男</Select.Option>
                                        <Select.Option value="1">女</Select.Option>
                                        <Select.Option value="2">保密</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="个人签名"
                                    name="signature"
                                    rules={[{ required: true, message: 'Please input your username!' }]}
                                >
                                    <Input.TextArea rows={3} />
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
                                    src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                                />
                                <Button icon={<UploadOutlined />} style={{ marginLeft: '16px' }}>更换头像</Button>
                            </div>

                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="安全设置" key="2">
                    <div className="user-safe-wrapper">
                        <List
                            itemLayout="horizontal"
                            dataSource={data}
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
            </Tabs>
        </Card>
    )
}

export default Settings
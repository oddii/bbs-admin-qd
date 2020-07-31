import React, { useState, useEffect } from 'react'
import { PageHeader, Tag, Button, Badge, Descriptions, Statistic, Card, Table, List, Popconfirm, message } from 'antd';
import { RollbackOutlined, EditOutlined, FileZipOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import './index.scss'

const { Column } = Table
const i = 1
const data = {
    id: i,
    category_name: `分区名称${i}`,
    board_name: `板块名称${i}`,
    type: Math.floor(Math.random() * 2),
    title: `主题帖名称${i}`,
    content: `主题贴内容${i}`,
    submit_time: new Date().toLocaleString(),
    submitter_user: `提交用户${i}`,
    submitter_ip: '111.111.111.111',
    view_count: Math.floor(Math.random() * 1025),
    reply_count: Math.floor(Math.random() * 1025),
    last_reply_time: new Date().toLocaleString(),
    last_replier_user: `最后回复用户${i}`,
    pinned: Math.floor(Math.random() * 2),
    featured: Math.floor(Math.random() * 2),
    edit_time: new Date().toLocaleString(),
    editor_user: `最后编辑用户${i}`,
    editor_ip: '111.111.111.111'
}

const operationData = []
for (let i = 0; i < 10; i++) {
    operationData.push({
        id: i,
        name: `操作${i}`,
        operator_user: `操作用户${i}`,
        operator_ip: `11.11.11.11`,
        reason: `操作原因${i}`,
        operate_time: new Date().toLocaleString()
    })
}

const attachmentData = []
for (let i = 0; i < 10; i++) {
    attachmentData.push({
        id: i,
        topic_name: `主题帖${i}`,
        filename: `原始文件名${i}`,
        file_path: `https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png`,
        file_size: `${Math.floor(Math.random() * 1025)} M`,
        description: `这是文件${i}的文件描述`,
        download_count: `${Math.floor(Math.random() * 1000)}`,
        upload_time: new Date().toLocaleString(),
        uploader_user: `上传用户${i}`,
        uploader_ip: '111.111.111.111'
    })
}

function TopicInfo() {

    const history = useHistory()

    const [topicInfo, setTopicInfo] = useState({})

    const handleAttachmentItemDelete = item => {
        message.success(`成功删除名称为 “${item.filename}” 的附件！`)
    }

    useEffect(() => {
        setTopicInfo(data)
    }, [])

    return (
        <div className="topic-info-wrapper">
            <PageHeader
                ghost={false}
                title={topicInfo.title}
                tags={
                    <>
                        <Tag style={{ marginRight: '16px' }} color="blue">普通帖子</Tag>
                        <Badge style={{ marginRight: '16px' }} status="processing" text="置顶" />
                        <Badge status="success" text="精华" />
                    </>
                }
                // subTitle="This is a subtitle"
                extra={[
                    <Button key="back" icon={<RollbackOutlined />} onClick={() => history.goBack()}>返回</Button>,
                    <Button key="update" icon={<EditOutlined />} type="primary">编辑</Button>
                ]}
            >
                <div style={{ display: 'flex' }}>
                    <Descriptions column={2}>
                        <Descriptions.Item label="发布用户">{topicInfo.submitter_user}</Descriptions.Item>
                        <Descriptions.Item label="所属板块">{topicInfo.board_name}</Descriptions.Item>
                        <Descriptions.Item label="发布时间">{topicInfo.submit_time}</Descriptions.Item>
                        <Descriptions.Item label="所属分区">{topicInfo.category_name}</Descriptions.Item>
                        <Descriptions.Item label="发布用户Ip">
                            <span style={{ color: '#1890ff' }}>{topicInfo.submitter_ip}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="最后回复时间">{topicInfo.last_reply_time}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户">{topicInfo.editor_user}</Descriptions.Item>
                        <Descriptions.Item label="最后回复用户">{topicInfo.last_replier_user}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑时间">{topicInfo.edit_time}</Descriptions.Item>
                        <Descriptions.Item label=""></Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户Ip">
                            <span style={{ color: '#1890ff' }}>{topicInfo.editor_ip}</span>
                        </Descriptions.Item>
                    </Descriptions>
                    <div style={{ display: 'flex' }}     >
                        <Statistic title="浏览次数" value={topicInfo.view_count} style={{ marginRight: 32, minWidth: 56 }} />
                        <Statistic title="回复次数" value={topicInfo.reply_count} style={{ minWidth: 56 }} />
                    </div>
                </div>
            </PageHeader>

            <Card
                title="内容"
                style={{ margin: '24px 0' }}>

            </Card>

            <Card
                title="附件"
                extra={<Button>新建附件</Button>}>
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
                    dataSource={attachmentData}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                hoverable
                                actions={[
                                    <div><EditOutlined key="update" /> 修改</div>,
                                    <div><DownloadOutlined key="download" /> 下载</div>,
                                    <Popconfirm
                                        title="删除后不可恢复，您确认删除本项吗？"
                                        onConfirm={() => handleAttachmentItemDelete(item)}
                                        okText="是的！"
                                        cancelText="我再想想..."
                                    >
                                        <div><DeleteOutlined key="delete" /> 删除</div>
                                    </Popconfirm>
                                ]}
                            >
                                <div className="list-item-wrapper">
                                    <div className="item-filename">
                                        <FileZipOutlined /> {item.filename}
                                    </div>
                                    <div className="item-description">{item.description}</div>
                                    <div className="item-filepath">路径：<span>{item.file_path}</span></div>
                                    <div className="item-user-meta">
                                        <div className="item-upload-user">上传用户：<span>{item.uploader_user}</span></div>
                                        <div className="item-upload-ip">Ip：<span>{item.uploader_ip}</span></div>
                                    </div>
                                    <div className="item-upload-time">上传时间：{item.upload_time}</div>
                                    <div className="item-meta">
                                        <div className="item-filesize">{item.file_size}</div>
                                        <div className="item-count"><span>{item.download_count}</span> /次下载</div>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            </Card>

            <Card
                title="回复"
                style={{ margin: '24px 0' }}>

            </Card>

            <Card
                title="操作日志">

                <Table
                    rowKey="id"
                    dataSource={operationData}
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
                    <Column title="操作名称" dataIndex="name" key="name" align="center" width={200} />
                    <Column title="操作原因" dataIndex="reason" key="reason" align="center" />
                    <Column title="操作用户" dataIndex="operator_user" key="operator_user" align="center" width={200} />
                    <Column title="操作用户Ip" dataIndex="operator_ip" key="operator_ip" align="center" width={180} />
                    <Column title="操作时间" dataIndex="operate_time" key="operate_time" align="center" width={180} />
                </Table>
            </Card>
        </div>
    )
}

export default TopicInfo

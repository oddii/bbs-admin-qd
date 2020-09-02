import React, { useState, useEffect, useCallback } from 'react'
import {
    PageHeader, Tag, Button, Badge, Descriptions, Statistic, Card, Table,
    List, Popconfirm, message, Upload, Avatar
} from 'antd';
import {
    RollbackOutlined, EditOutlined, FileZipOutlined, DeleteOutlined, DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons'
import { useHistory, useParams } from 'react-router-dom'

import topicApi from '../../api/topic'
import attachmentApi from '../../api/attachment'
import { getData } from '../../utils/apiMethods'
import { CONFIG } from '../../constant'
import filesize from 'filesize'
import './index.scss'


const { Column } = Table



function TopicInfo() {

    const { id } = useParams()
    const history = useHistory()

    const [topicInfo, setTopicInfo] = useState({})
    const [topicOperation, setTopicOperation] = useState([])


    const getTopicInfo = useCallback(id => {
        getData(topicApi.getTopicInfo, { topicId: id }).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setTopicInfo(data)
        })
    }, [])

    const getTopicOperation = useCallback(id => {
        getData(topicApi.getTopicOperation, { topicId: id }).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setTopicOperation(data)
        })
    }, [])

    const handleToUserItemInfo = id => {
        history.push(`/admin/user/center/${id}`)
    }

    const handleToItemEdit = () => {
        history.push(`/admin/topic/edit/${id}`)
    }

    const handleAttachmentItemDelete = item => {
        message.success(`成功删除名称为 “${item.filename}” 的附件！`)
    }

    useEffect(() => {
        getTopicInfo(id)
        getTopicOperation(id)
    }, [getTopicInfo, getTopicOperation, id])

    return (
        <div className="topic-info-wrapper">
            <PageHeader
                ghost={false}
                tags={
                    <>
                        <Avatar src={
                            topicInfo.submitterAvatarPath
                                ? CONFIG.baseUrl + topicInfo.submitterAvatarPath.substring(1, topicInfo.submitterAvatarPath.length)
                                : null} />
                        <span style={{ margin: '0 16px 0 0', fontSize: 20, color: '#000', fontWeight: 600 }}>{topicInfo.title}</span>
                        <Tag color="blue">普通帖子</Tag>
                        <Badge style={{ marginRight: '16px' }} status="processing" text="置顶" />
                        <Badge status="success" text="精华" />
                    </>
                }
                extra={[
                    <Button key="back" icon={<RollbackOutlined />} onClick={() => history.goBack()}>返回</Button>,
                    <Button key="update" icon={<EditOutlined />} type="primary"
                        onClick={handleToItemEdit}>编辑</Button>
                ]}
            >
                <div style={{ display: 'flex' }}>
                    <Descriptions column={2}>
                        <Descriptions.Item label="发布用户">{topicInfo.submitterUsername}</Descriptions.Item>
                        <Descriptions.Item label="所属板块">{topicInfo.boardName}</Descriptions.Item>
                        <Descriptions.Item label="发布时间">{topicInfo.submitTime}</Descriptions.Item>
                        <Descriptions.Item label="所属分区">{topicInfo.categoryName}</Descriptions.Item>
                        <Descriptions.Item label="发布用户Ip">
                            <span style={{ color: '#1890ff' }}>{topicInfo.submitterIp}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="最后回复时间">{topicInfo.lastReplyTime}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户">{topicInfo.editorUsername}</Descriptions.Item>
                        <Descriptions.Item label="最后回复用户">{topicInfo.lastReplierUsername}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑时间">{topicInfo.editTime}</Descriptions.Item>
                        <Descriptions.Item label="最后回复用户Ip">
                            <span style={{ color: '#1890ff' }}>{topicInfo.lastReplierIp}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户Ip">
                            <span style={{ color: '#1890ff' }}>{topicInfo.editorIp}</span>
                        </Descriptions.Item>
                    </Descriptions>
                    <div style={{ display: 'flex' }}     >
                        <Statistic title="浏览次数" value={topicInfo.viewCount} style={{ marginRight: 32, minWidth: 56 }} />
                        <Statistic title="回复次数" value={topicInfo.replyCount} style={{ minWidth: 56 }} />
                    </div>
                </div>
            </PageHeader>

            <Card
                title="内容"
                style={{ margin: '24px 0' }}>
                <div dangerouslySetInnerHTML={{ __html: topicInfo.content }}>

                </div>
            </Card>

            <Card
                title="附件">
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
                    dataSource={topicInfo.attachments}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                hoverable
                                actions={[
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
                                    <div className="item-filepath">路径：<span>{item.downloadUrl}</span></div>
                                    {/* <div className="item-user-meta">
                                        <div className="item-upload-user">上传用户：<span>{item.uploader_user}</span></div>
                                        <div className="item-upload-ip">Ip：<span>{item.uploader_ip}</span></div>
                                    </div> */}
                                    <div className="item-upload-time">上传时间：{item.uploadTime}</div>
                                    <div className="item-meta">
                                        <div className="item-filesize">{filesize(item.fileSize)}</div>
                                        <div className="item-count"><span>{item.downloadCount}</span> /次下载</div>
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
                    dataSource={topicOperation}
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
                    <Column title="操作名称" dataIndex="operateType" key="operateType" align="center" width={200} />
                    <Column title="操作原因" dataIndex="reason" key="reason" align="center" />
                    <Column title="操作用户" dataIndex="operatorUsername" key="operatorUsername" align="center" width={200}
                        render={(text, record) =>
                            <Button type="link" onClick={() => handleToUserItemInfo(record.operatorUserId)}>{text}</Button>
                        } />
                    <Column title="操作用户Ip" dataIndex="operatorIp" key="operatorIp" align="center" width={180} />
                    <Column title="操作时间" dataIndex="operateTime" key="operateTime" align="center" width={180} />
                </Table>
            </Card>
        </div>
    )
}

export default TopicInfo

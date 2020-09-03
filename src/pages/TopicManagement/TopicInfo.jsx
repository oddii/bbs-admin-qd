import React, { useState, useEffect, useCallback } from 'react'
import {
    PageHeader, Tag, Button, Badge, Descriptions, Statistic, Card, Table,
    List, message, Avatar, Modal
} from 'antd';
import {
    RollbackOutlined, EditOutlined, FileZipOutlined
} from '@ant-design/icons'
import { useHistory, useParams } from 'react-router-dom'

// 引入编辑器组件
import BraftEditor from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'

import { downloadFile } from '../../utils/utils'
import topicApi from '../../api/topic'
import replyApi from '../../api/reply'
import { getData, postData } from '../../utils/apiMethods'
import { CONFIG } from '../../constant'
import filesize from 'filesize'
import './index.scss'


const { Column } = Table



function TopicInfo() {

    const { id } = useParams()
    const history = useHistory()

    const [topicInfo, setTopicInfo] = useState({})

    const [topicReplyList, setTopicReplyList] = useState([])
    const [toplicReplyListCurrentPage, setTopicReplyListCurrentPage] = useState(1)
    const [toplicReplyListPageSize, setTopicReplyListPageSize] = useState(10)
    const [toplicReplyListTotal, setTopicReplyListTotal] = useState(0)

    const [topicReplyInfo, setTopicReplyInfo] = useState({})
    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))
    const [editorReadOnly, setEditorReadOnly] = useState(true)
    const [topicReplyInfoModalVisible, setTopicReplyInfoModalVisible] = useState(false)

    const [topicOperation, setTopicOperation] = useState([])

    const getTopicInfo = useCallback(id => {
        getData(topicApi.getTopicInfo, { topicId: id }).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setTopicInfo(data)
        }).catch(() => {
            message.error('服务器出现错误，请稍后再试')
        })
    }, [])

    const getTopicReplyList = useCallback(params => {
        getData(replyApi.getReplyList, params).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setTopicReplyList(data.content)
            setTopicReplyListCurrentPage(data.currentPage)
            setTopicReplyListPageSize(data.pageSize)
            setTopicReplyListTotal(data.totalRecords)
        }).catch(() => {
            message.error('服务器出现错误，请稍后再试')
        })
    }, [])

    const getTopicOperation = useCallback(id => {
        getData(topicApi.getTopicOperation, { topicId: id }).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            setTopicOperation(data)
        }).catch(() => {
            message.error('服务器出现错误，请稍后再试')
        })
    }, [])

    /**
     * 列表项查看详情事件
     * @param {列表项} item 
     */
    const handleToReplyItemInfo = item => {
        setTopicReplyInfo(item)
        setEditorState(BraftEditor.createEditorState(item.content))
        setTopicReplyInfoModalVisible(true)
    }


    const handleTopicReplyInfoModalCancel = () => {
        setTopicReplyInfoModalVisible(false)
        setEditorReadOnly(true)
    }

    const handleTopicReplyInfoModalSubmit = () => {
        postData(replyApi.updateReply, {
            replyId: topicReplyInfo.id,
            content: editorState.toHTML()
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success('更新成功')
            getTopicReplyList({
                topicId: id,
                count: toplicReplyListPageSize,
                page: toplicReplyListCurrentPage
            })
            setEditorReadOnly(true)
            setTopicReplyInfoModalVisible(false)
        })
    }

    const handleItemDownload = item => {
        let { filename, downloadUrl } = item
        downloadUrl = CONFIG.baseUrl + downloadUrl.substring(1, downloadUrl.length)
        downloadFile(filename, downloadUrl)
    }

    const handleToUserItemInfo = id => {
        history.push(`/admin/user/center/${id}`)
    }

    const handleToItemEdit = () => {
        history.push(`/admin/topic/edit/${id}`)
    }

    useEffect(() => {
        getTopicInfo(id)
        getTopicReplyList({
            topicId: id,
            count: toplicReplyListPageSize,
            page: toplicReplyListCurrentPage
        })
        getTopicOperation(id)
    }, [getTopicInfo, getTopicOperation, getTopicReplyList, id, toplicReplyListCurrentPage, toplicReplyListPageSize])

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
                        {
                            topicInfo.type === 0
                                ? <Tag color="blue">普通帖子</Tag>
                                : <Tag >公告</Tag>
                        }
                        {
                            topicInfo.pinned
                                ? <Badge style={{ marginRight: '16px' }} status="processing" text="置顶" />
                                : null
                        }
                        {
                            topicInfo.featured
                                ? <Badge status="success" text="精华" />
                                : null
                        }
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
                            >
                                <div className="list-item-wrapper">
                                    <div className="item-filename">
                                        <span><FileZipOutlined /> {item.filename}</span>
                                        <span className="btn-download" onClick={() => handleItemDownload(item)}>下载</span>
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

                <Table
                    rowKey="id"
                    dataSource={topicReplyList}
                    pagination={{
                        current: toplicReplyListCurrentPage,
                        pageSize: toplicReplyListPageSize,
                        total: toplicReplyListTotal,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`,
                        onChange: (currentPage, pageSize) => getTopicReplyList({ topicId: id, page: currentPage, count: pageSize })
                    }}>
                    <Column
                        title="#"
                        key="index"
                        align="center"
                        width={65}
                        render={(text, record, index) => index + 1} />
                    <Column title="回复内容" dataIndex="shortContent" key="shortContent" align="center" ellipsis />
                    <Column title="回复用户" dataIndex="replierUsername" key="replierUsername" align="center" width={180}
                        ellipsis
                        render={(text, record) =>
                            <Button type="link" onClick={() => handleToUserItemInfo(record.replierUserId)}>{text}</Button>
                        } />
                    <Column title="回复时间" dataIndex="replyTime" key="replyTime" align="center" width={180} />
                    <Column title="最后编辑用户" dataIndex="editorUsername" key="editorUsername" align="center" width={180}
                        ellipsis
                        render={(text, record) =>
                            <Button type="link" onClick={() => handleToUserItemInfo(record.editorUserId)}>{text}</Button>
                        } />
                    <Column title="最后编辑时间" dataIndex="editTime" key="editTime" align="center" width={180} />
                    <Column
                        title="操作"
                        key="action"
                        align="center"
                        width={65}
                        render={(text, record) => (
                            <>
                                <span className="btn-option" onClick={() => handleToReplyItemInfo(record)}>详情</span>
                            </>
                        )}
                    />
                </Table>
            </Card>

            <Card
                title="操作日志">

                <Table
                    rowKey="id"
                    dataSource={topicOperation}
                    pagination={false}>
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

            <Modal
                title="回复详情"
                className="reply-info-wrapper"
                width={1200}
                visible={topicReplyInfoModalVisible}
                maskClosable={false}
                onCancel={() => handleTopicReplyInfoModalCancel()}
                footer={
                    editorReadOnly ?
                        <Button onClick={() => setEditorReadOnly(false)}>编辑</Button>
                        : <Button type="primary" onClick={handleTopicReplyInfoModalSubmit}>提交</Button>
                }
            >
                <div>
                    <Descriptions bordered>
                        <Descriptions.Item label="主题帖名称" span={3}>{topicReplyInfo.topicTitle}</Descriptions.Item>
                        <Descriptions.Item label="回复时间" span={1.5}>{topicReplyInfo.replyTime}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑时间" span={1.5}>{topicReplyInfo.editTime}</Descriptions.Item>
                        <Descriptions.Item label="回复用户">{topicReplyInfo.replierUsername}</Descriptions.Item>
                        <Descriptions.Item label="回复用户昵称">{topicReplyInfo.replierNickname}</Descriptions.Item>
                        <Descriptions.Item label="回复用户Ip">{topicReplyInfo.replierIp}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户">{topicReplyInfo.editorUsername}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户昵称">{topicReplyInfo.editorNickname}</Descriptions.Item>
                        <Descriptions.Item label="最后编辑用户Ip">{topicReplyInfo.editorIp}</Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: 10 }}>
                        <BraftEditor
                            value={editorState}
                            readOnly={editorReadOnly}
                            onChange={editorState => setEditorState(editorState)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default TopicInfo

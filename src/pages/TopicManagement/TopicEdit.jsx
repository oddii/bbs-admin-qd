import React, { useState, useEffect } from 'react'
import {
    Card, Form, Col, Select, Cascader, Row, Input, message, Button,
    Upload, List, Popconfirm, Modal
} from 'antd'
import {
    EditOutlined, DownloadOutlined, DeleteOutlined,
    FileZipOutlined, UploadOutlined, RollbackOutlined
} from '@ant-design/icons'
import { useParams, Prompt, useHistory } from 'react-router-dom'

import { downloadFile } from '../../utils/utils'
import { CONFIG } from '../../constant'
import topicApi from '../../api/topic'
import boardApi from '../../api/board'
import attachmentApi from '../../api/attachment'
import { getData, postData } from '../../utils/apiMethods'

// 引入编辑器组件
import BraftEditor from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'

import moment from 'moment'
import filesize from 'filesize'
import './index.scss'
import { useCallback } from 'react'

const { Option } = Select
//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

//  上传文件前校验
const beforeUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('上传文件大小不能超过2MB！');
        return false
    }

    return true
}

//  上传组件参数
const uploadProps = {
    name: 'file',
    action: attachmentApi.uploadAttachment,
    withCredentials: true,
    showUploadList: false,
    beforeUpload
}


function TopicCreate() {

    const { id } = useParams()
    const history = useHistory()

    const [isSave, setIsSave] = useState(false)
    const [editForm] = Form.useForm()
    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))

    const [title, setTitle] = useState('')
    const [boardId, setBoardId] = useState([])
    const [boardName, setBoardName] = useState('')
    const [type, setType] = useState('')
    const [attachments, setAttachments] = useState([])

    const [attachmentUpdateForm] = Form.useForm()
    const [attachmentInfo, setAttachmentInfo] = useState({})
    const [attachmentUpdateModalVisible, setAttachmentUpdateModalVisible] = useState(false)


    const [boardNameList, setBoardNameList] = useState([])

    const getTopicInfo = useCallback(id => {
        getData(topicApi.getTopicDetail, { topicId: id }).then(result => {
            const { code, data, msg } = result.data
            if (code !== 200) return message.error(msg)
            const { title, boardId, boardName, type, attachments, content } = data
            setTitle(title)
            setBoardId(boardId)
            setBoardName(boardName)
            setType(type)
            setAttachments(attachments)
            setEditorState(BraftEditor.createEditorState(content))
            editForm.setFieldsValue({ title, type })
        }).catch(() => {
            message.error('服务器出现错误，请稍后再试')
        })
    }, [editForm])

    const getTopicStatus = useCallback(() => {
        if (id) {
            getTopicInfo(id)
        } else {
            editForm.setFieldsValue({ title, boardId, type })
        }
    }, [boardId, editForm, getTopicInfo, id, title, type])



    /**
     * 获取板块名称列表
     */
    const getBoardNameList = () => {
        getData(boardApi.getBoardNameList).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error()
            setBoardNameList(data)
        })
    }

    /**
     * 新建帖子确定事件
     */
    const handleTopicInfoInsert = () => {
        if (editorState.isEmpty()) return message.error('请输入帖子内容！')
        editForm.validateFields(['title', 'boardId', 'type']).then(result => {
            const { title, boardId, type } = result
            postData(topicApi.addTopic, {
                type,
                title,
                content: editorState.toHTML(),
                boardId: boardId[1],
                attachments
            }).then(result => {
                const { code, data, msg } = result.data
                if (code !== 200) return message.error(msg)
                setIsSave(true)
                message.success('发布成功！')
                return history.push(`/admin/topic/id/${data.id}`)
            })
        }).catch(error => {
            const { errorFields } = error
            const { errors } = errorFields[0]
            message.error(errors[0])
        })
    }

    /**
     * 编辑帖子保存事件
     */
    const handleTopicInfoUpdate = () => {
        if (editorState.isEmpty()) return message.error('请输入帖子内容！')
        editForm.validateFields(['title', 'boardId', 'type']).then(result => {
            const { title, type } = result
            postData(topicApi.updateTolic, {
                topicId: id,
                title,
                type,
                content: editorState.toHTML(),
                attachments
            }).then(result => {
                const { code, msg } = result.data
                if (code !== 200) return message.error(msg)
                setIsSave(true)
                return message.success('保存成功！')
            })
        }).catch(error => {
            const { errorFields } = error
            const { errors } = errorFields[0]
            message.error(errors[0])
        })
    }

    const handleAttachmentUploadFinish = ({ file }) => {
        const { response, status, size } = file
        console.log(response);
        if (status === 'done') {
            const { code, msg, data } = response
            if (code !== 200) return message.error(msg)
            const { id, filename, downloadUrl } = data
            const attachment = {
                id,
                filename,
                downloadUrl,
                uploadTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                downloadCount: 0,
                description: '',
                fileSize: size
            }
            setAttachments([...attachments, attachment])
            return message.success('上传成功！')
        } else if (status === 'error') {
            return message.error('上传失败')
        }
    }

    const handleAttachmentItemUpdateModalShow = item => {
        setAttachmentInfo(item)
        attachmentUpdateForm.setFieldsValue({ description: item.description })
        setAttachmentUpdateModalVisible(true)
    }

    const handleAttachmentItemUpdateConfirm = () => {
        attachmentUpdateForm.validateFields(['description']).then(result => {
            const { description } = result
            setAttachmentInfo(Object.assign(attachmentInfo, { description }))
            attachments.map(item => {
                if (item.id === attachmentInfo.id) {
                    return attachmentInfo
                }
                return item
            })
            setAttachmentUpdateModalVisible(false)
            message.success('修改成功！')
        })
    }

    const handleAttachmentItemDownload = item => {
        let { filename, downloadUrl } = item
        downloadUrl = CONFIG.baseUrl + downloadUrl.substring(1, downloadUrl.length)
        downloadFile(filename, downloadUrl)
    }

    const handleAttachmentItemDelete = item => {
        setAttachments(attachments.filter(attachment => item.id !== attachment.id))
        message.success('删除成功！')
    }


    useEffect(() => {
        getBoardNameList()
        getTopicStatus()
    }, [getTopicStatus])


    return (
        <div className="topic-edit-wrapper">
            <Prompt
                when={true}
                message={() => isSave ? true : '您有改动尚未保存，确定离开当前页面吗？'}
            />


            <Card
                title={id ? "编辑帖子" : '新建帖子'}
                extra={<Button
                    icon={<RollbackOutlined />}
                    onClick={() => history.goBack()}> 返回</Button>}
            >

                <Form
                    form={editForm}>
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label="帖子标题"
                                rules={[{ required: true, message: '请输入帖子标题！' }]}
                                required={false}>
                                <Input
                                    allowClear
                                    placeholder="请输入帖子标题" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={6} >
                            {
                                id
                                    ? <div style={{ color: 'rgba(0, 0, 0, 0.85)' }}><span>板块名称：</span>{boardName}</div>
                                    : <Form.Item
                                        name='boardId'
                                        label='板块名称'
                                        rules={[{ required: true, message: '请选择板块名称！' }]}
                                        required={false}
                                        style={{ marginBottom: 0 }}>
                                        <Cascader
                                            options={boardNameList}
                                            fieldNames={boardNameListfieldNames}
                                            placeholder="请选择板块名称" />
                                    </Form.Item>
                            }
                        </Col>

                        <Col span={6} >
                            <Form.Item
                                name='type'
                                label='帖子类型'
                                rules={[{ required: true, message: '请选择帖子类型！' }]}
                                required={false}
                                style={{ marginBottom: 0 }}>
                                <Select placeholder="请选择帖子类型" allowClear>
                                    <Option value={0}>普通主题</Option>
                                    <Option value={1}>公告</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12} style={{ textAlign: 'right' }}>
                            {
                                id
                                    ? <Button onClick={handleTopicInfoUpdate}>保存</Button>
                                    : <Button type="primary" onClick={handleTopicInfoInsert}>发布</Button>
                            }
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card
                style={{ margin: '24px 0' }}
                title="内容">
                <BraftEditor
                    value={editorState}
                    media={{
                        accepts: {
                            image: 'image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg'
                        },
                        externals: {
                            image: true,
                            video: false,
                            audio: false,
                            embed: false
                        }
                    }}
                    onChange={editorState => setEditorState(editorState)}
                />
            </Card>

            <Card
                title="附件"
                extra={
                    <Upload {...uploadProps} onChange={handleAttachmentUploadFinish}>
                        <Button icon={<UploadOutlined />}>上传附件</Button>
                    </Upload>}>
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
                    dataSource={attachments}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                hoverable
                                actions={[
                                    <div
                                        onClick={() => handleAttachmentItemUpdateModalShow(item)}>
                                        <EditOutlined key="edit" /> 编辑
                                    </div>,
                                    <div
                                        onClick={() => handleAttachmentItemDownload(item)}>
                                        <DownloadOutlined key="download" /> 下载
                                    </div>,
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

            <Modal
                title='编辑附件描述'
                visible={attachmentUpdateModalVisible}
                maskClosable={false}
                onCancel={() => setAttachmentUpdateModalVisible(false)}
                footer={<Button type="primary" onClick={handleAttachmentItemUpdateConfirm}>确定</Button>}>

                <Form
                    form={attachmentUpdateForm}>
                    <Form.Item name="description" label="附件描述"
                        rules={[{ required: true, message: '请输入附件描述！' }]}>
                        <Input.TextArea placeholder="请输入附件描述" />
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    )
}

export default TopicCreate
import React, { useState, useEffect } from 'react'
import {
    Card, Table, Popconfirm, message, Form, Cascader,
    DatePicker, AutoComplete, Row, Col, Button, Input,
    ConfigProvider, Modal, Descriptions
} from 'antd'
import zhCN from 'antd/es/locale/zh_CN';  // 引入中文包
import { useHistory } from 'react-router-dom'
import moment from 'moment'
// 引入编辑器组件
import BraftEditor from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'

import { debounce } from '../../utils/utils'
import replyApi from '../../api/reply'
import boardApi from '../../api/board'
import userApi from '../../api/user'
import { getData, postData } from '../../utils/apiMethods'
import './index.scss'

const { Column } = Table

//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

/**
 * 渲染自动完成选项的 item
 * @param {自动完成选项} item 
 */
const renderAutoCompleteItem = item => ({
    value: item.username,
    label: (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
            }}
        >
            <span>{item.username}</span>
            <span>{item.nickname}</span>
        </div>
    ),
})

function ReplyList() {

    const history = useHistory()

    const [editorState, setEditorState] = useState(BraftEditor.createEditorState(null))
    const [editorReadOnly, setEditorReadOnly] = useState(true)
    const [searchform] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [replyInfo, setReplyInfo] = useState({})
    const [modalVisible, setModalVisible] = useState(false)
    const hasSelected = selectedRowKeys.length > 0

    const [autoCompleteList, setAutoCompleteList] = useState([])
    const [boardId, setBoardId] = useState([])
    const [username, setUsername] = useState('')
    const [keyword, setKeyword] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const [boardNameList, setBoardNameList] = useState([])
    const [replyList, setReplyList] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(0)
    const [total, setTotal] = useState(0)

    /**
     * 通用 useState 的 Setter
     * @param {属性字段} property 
     */
    const commonSetter = property => {
        const obj = {
            boardId: setBoardId,
            username: setUsername,
            keyword: setKeyword,
            from: setFrom,
            to: setTo
        }
        return obj[property]
    }

    /**
     * 获取附件列表
     * @param {参数} params 
     */
    const getReplyList = (params = {}) => {
        getData(replyApi.getReplyList, params).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            const { content, currentPage, pageSize, totalRecords } = data
            setReplyList(content)
            setCurrentPage(currentPage)
            setPageSize(pageSize)
            setTotal(totalRecords)
        })
    }

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
     * 自动完成输入框输入事件
     * @param {自动完成输入框值} value 
     */
    const handleAutoComplete = value => {
        getData(userApi.getUsernameList, { user: value })
            .then(result => {
                let { code, data } = result.data
                if (code !== 200) return message.error('')
                data = data.map(item => renderAutoCompleteItem(item))
                setAutoCompleteList(data)
            })
    }

    /**
     * 列表选中项变化事件
     * @param {列表选中项} selectedRowKeys 
     */
    const handleTableSelectChange = selectedRowKeys => {
        setSelectedRowKeys(selectedRowKeys)
    }

    /**
     * 页数与页面大小改变事件
     * @param {参数} params 
     */
    const handlePageChange = (params = {}) => {
        const searchFormOldValue = {
            boardId,
            username,
            filename: keyword,
            from,
            to
        }
        searchform.setFieldsValue(searchFormOldValue)
        for (let key in searchFormOldValue) {
            if (searchFormOldValue.hasOwnProperty(key)) {
                if (searchFormOldValue[key]) {
                    if (key === 'from' || key === 'to') {
                        params[key] = moment(searchFormOldValue[key]).format('YYYY-MM-DD hh:mm:ss')
                    } else if (key === 'boardId') {
                        params[key] = searchFormOldValue[key][searchFormOldValue[key].length - 1]
                    } else {
                        params[key] = searchFormOldValue[key]
                    }
                }
            }
        }
        getReplyList(params)
    }

    /**
     * 表单搜索事件
     * @param {表单值} values 
     */
    const handleSearch = values => {
        console.log(values);
        const params = {}
        for (let key in values) {
            if (values.hasOwnProperty(key)) {
                if (values[key]) {
                    if (key === 'from' || key === 'to') {
                        if (values[key]) {
                            params[key] = moment(values[key]).format('YYYY-MM-DD HH:mm:ss')
                        }
                    } else if (key === 'boardId') {
                        if (values[key]) {
                            params[key] = values[key][values[key].length - 1]
                        }
                    } else {
                        params[key] = values[key]
                    }
                }
                commonSetter(key)(values[key])
            }
        }
        params.page = 1
        params.count = pageSize
        getReplyList(params)
    }

    /**
     * 表单重置事件
     */
    const handleReset = () => {
        setAutoCompleteList([])
        setBoardId([])
        setUsername('')
        setKeyword('')
        setFrom('')
        setTo('')
        searchform.resetFields()
    }

    /**
     * 列表项查看详情事件
     * @param {列表项} item 
     */
    const handleToItemInfo = item => {
        setReplyInfo(item)
        setEditorState(BraftEditor.createEditorState(item.content))
        setModalVisible(true)
    }

    const handleToTopicItemInfo = item => {
        history.push(`/admin/topic/id/${item.topicId}`)
    }

    const handleToUserItemInfo = id => {
        history.push(`/admin/user/center/${id}`)
    }

    const handleInfoModalCancel = () => {
        setModalVisible(false)
        setEditorReadOnly(true)
    }

    /**
     * 更新回复详情信息
     */
    const handleInfoModalSubmit = () => {
        postData(replyApi.updateReply, {
            replyId: replyInfo.id,
            content: editorState.toHTML()
        }).then(result => {
            const { code, msg } = result.data
            if (code !== 200) return message.error(msg)
            message.success('更新成功')
            getReplyList({
                page: currentPage,
                count: pageSize
            })
            setEditorReadOnly(true)
            setModalVisible(false)
        })
    }

    /**
     * 列表选中项删除事件
     */
    const handleItemsDelete = () => {
        postData(replyApi.delBatchReply, { idList: selectedRowKeys }).then(result => {
            const { code } = result.data
            if (code !== 200) return message.error('')
            message.success('删除成功')
            setSelectedRowKeys([])
            getReplyList({
                page: currentPage,
                count: pageSize
            })
        })
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: handleTableSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT
        ]
    }

    useEffect(() => {
        getReplyList({
            page: 1,
            count: 10
        })
    }, [])

    useEffect(() => {
        getBoardNameList()
    }, [])

    return (
        <>
            <ConfigProvider locale={zhCN} className="reply-list-wrapper">
                <Card
                    title="回复列表">
                    <Form
                        form={searchform}
                        onFinish={handleSearch}
                    >
                        <Row gutter={24}>
                            <Col span={6} >
                                <Form.Item name='username' label='上传用户' >
                                    <AutoComplete
                                        allowClear
                                        dropdownMatchSelectWidth={250}
                                        options={autoCompleteList}
                                        onSearch={debounce(handleAutoComplete, 500)}
                                        placeholder="请输入用户名/用户昵称"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={6} >
                                <Form.Item name='keyword' label='关键名词' >
                                    <Input placeholder="请输入关键名词" allowClear />
                                </Form.Item>
                            </Col>

                            <Col span={6} >
                                <Form.Item name='boardId' label='板块名称' >
                                    <Cascader
                                        options={boardNameList}
                                        fieldNames={boardNameListfieldNames}
                                        placeholder="请选择板块名称" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={6} >
                                <Form.Item name='from' label='开始时间' style={{ marginBottom: 0 }}>
                                    <DatePicker showTime />
                                </Form.Item>
                            </Col>

                            <Col span={6} >
                                <Form.Item name='to' label='结束时间' style={{ marginBottom: 0 }}>
                                    <DatePicker showTime />
                                </Form.Item>
                            </Col>

                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Button type="primary" htmlType="submit">
                                    搜索
                            </Button>
                                <Button
                                    style={{ margin: '0 8px' }}
                                    onClick={() => handleReset()}>
                                    清空
                            </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card>

                <Card
                    style={{ marginTop: 24 }}>
                    <Row gutter={24}>
                        <Col span={24} style={{ textAlign: 'right', marginBottom: 16 }}>
                            <span style={{ marginRight: 8 }}>
                                {hasSelected ? `当前已选中 ${selectedRowKeys.length} 项` : ''}
                            </span>
                            <Popconfirm
                                title="删除后不可恢复，您确认删除已选中项吗？"
                                onConfirm={handleItemsDelete}
                                okText="是的！"
                                cancelText="我再想想..."
                            >
                                <Button type="primary" disabled={!hasSelected}>删除选中项</Button>
                            </Popconfirm>
                        </Col>
                    </Row>

                    <Table
                        rowKey="id"
                        dataSource={replyList}
                        rowSelection={rowSelection}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total) => `Total ${total} items`,
                            onChange: (currentPage, pageSize) => handlePageChange({ page: currentPage, count: pageSize })
                        }}>
                        <Column
                            title="#"
                            key="index"
                            align="center"
                            width={65}
                            render={(text, record, index) => index + 1} />
                        <Column
                            title="主题帖名称"
                            dataIndex="topicTitle"
                            key="topicTitle"
                            align="center"
                            width={180}
                            ellipsis
                            render={(text, record) =>
                                <Button type="link" onClick={() => handleToTopicItemInfo(record)}>{record.topicTitle}</Button>
                            } />
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
                                    <span className="btn-option" onClick={() => handleToItemInfo(record)}>详情</span>
                                </>
                            )}
                        />
                    </Table>
                </Card>

                <Modal
                    title="回复详情"
                    className="reply-info-wrapper"
                    width={1200}
                    visible={modalVisible}
                    maskClosable={false}
                    onCancel={() => handleInfoModalCancel()}
                    footer={
                        editorReadOnly ?
                            <Button onClick={() => setEditorReadOnly(false)}>编辑</Button>
                            : <Button type="primary" onClick={handleInfoModalSubmit}>提交</Button>
                    }
                >
                    <div>
                        <Descriptions bordered>
                            <Descriptions.Item label="主题帖名称" span={3}>{replyInfo.topicTitle}</Descriptions.Item>
                            <Descriptions.Item label="回复时间" span={1.5}>{replyInfo.replyTime}</Descriptions.Item>
                            <Descriptions.Item label="最后编辑时间" span={1.5}>{replyInfo.editTime}</Descriptions.Item>
                            <Descriptions.Item label="回复用户">{replyInfo.replierUsername}</Descriptions.Item>
                            <Descriptions.Item label="回复用户昵称">{replyInfo.replierNickname}</Descriptions.Item>
                            <Descriptions.Item label="回复用户Ip">{replyInfo.replierIp}</Descriptions.Item>
                            <Descriptions.Item label="最后编辑用户">{replyInfo.editorUsername}</Descriptions.Item>
                            <Descriptions.Item label="最后编辑用户昵称">{replyInfo.editorNickname}</Descriptions.Item>
                            <Descriptions.Item label="最后编辑用户Ip">{replyInfo.editorIp}</Descriptions.Item>
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
            </ConfigProvider>
        </>
    )
}

export default ReplyList
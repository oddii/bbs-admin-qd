import React, { useState, useEffect } from 'react'
import {
    Card, Table, Divider, Popconfirm, message, AutoComplete,
    Button, Form, Col, Row, Input, DatePicker, Cascader, Descriptions,
    Modal, ConfigProvider
} from 'antd'
import { } from '@ant-design/icons';
import zhCN from 'antd/es/locale/zh_CN';  // 引入中文包
import moment from 'moment'
import filesize from 'filesize'
import { useHistory } from 'react-router-dom'

import { debounce, downloadFile } from '../../utils/utils'
import userApi from '../../api/user'
import attachmentApi from '../../api/attachment'
import boardApi from '../../api/board'
import { getData, postData } from '../../utils/apiMethods'
import '../../index.scss'
import { CONFIG } from '../../constant';

const { Column } = Table

//  板块名称列表对应属性
const boardNameListfieldNames = {
    label: 'name',
    value: 'id',
    children: 'boardList'
}

const renderAutoCompleteTitle = () => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 12
        }}>
        <span>用户名</span>
        <span>昵称</span>
    </div>
)

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

function AttachmentList() {

    const history = useHistory()

    const [searchform] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [attachmentInfo, setAttachmentInfo] = useState({})
    const [modalVisible, setModalVisible] = useState(false)
    const hasSelected = selectedRowKeys.length > 0

    const [autoCompleteList, setAutoCompleteList] = useState([])
    const [boardId, setBoardId] = useState([])
    const [username, setUsername] = useState('')
    const [filename, setFilename] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const [boardNameList, setBoardNameList] = useState([])
    const [attachmentList, setAttachmentList] = useState([])
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
            filename: setFilename,
            from: setFrom,
            to: setTo
        }
        return obj[property]
    }

    /**
     * 获取附件列表
     * @param {参数} params 
     */
    const getAttachmentList = (params = {}) => {
        getData(attachmentApi.getAttachmentList, params).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            const { content, currentPage, pageSize, totalRecords } = data
            setAttachmentList(content)
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
     * 页数与页面大小改变事件
     * @param {参数} params 
     */
    const handlePageChange = (params = {}) => {
        const searchFormOldValue = {
            boardId,
            username,
            filename,
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
        getAttachmentList(params)
    }

    /**
     * 列表选中项变化事件
     * @param {列表选中项} selectedRowKeys 
     */
    const handleTableSelectChange = selectedRowKeys => {
        setSelectedRowKeys(selectedRowKeys)
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
        getAttachmentList(params)
    }

    /**
     * 表单重置事件
     */
    const handleReset = () => {
        setAutoCompleteList([])
        setBoardId([])
        setUsername('')
        setFilename('')
        setFrom('')
        setTo('')
        searchform.resetFields()
    }

    const handleToTopicItemInfo = item => {
        history.push(`/admin/topic/id/${item.topicId}`)
    }

    const handleToUserItemInfo = id => {
        history.push(`/admin/user/center/${id}`)
    }

    /**
     * 列表选中项删除事件
     */
    const handleItemsDelete = () => {
        postData(attachmentApi.delBatchAttachment, { idList: selectedRowKeys }).then(result => {
            const { code } = result.data
            if (code !== 200) return message.error('')
            message.success('删除成功')
            setSelectedRowKeys([])
            getAttachmentList({
                page: currentPage,
                count: pageSize
            })
        })
    }

    const handleItemDownload = item => {
        let { filename, downloadUrl } = item
        downloadUrl = CONFIG.baseUrl + downloadUrl.substring(1, downloadUrl.length)
        downloadFile(filename, downloadUrl)
    }

    /**
     * 列表项查看详情事件
     * @param {列表项} item 
     */
    const handleToItemInfo = item => {
        setAttachmentInfo(item)
        setModalVisible(true)
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
        getAttachmentList({
            page: 1,
            count: 10
        })
    }, [])

    useEffect(() => {
        getBoardNameList()
    }, [])

    return (
        <>
            <ConfigProvider locale={zhCN} className="attacment-list-wrapper">
                <Card title="附件列表">
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
                                        options={[{ label: renderAutoCompleteTitle(), options: autoCompleteList }]}
                                        onSearch={debounce(handleAutoComplete, 500)}
                                        placeholder="请输入用户名/用户昵称"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={6} >
                                <Form.Item name='filename' label='文件名称' >
                                    <Input placeholder="请输入文件名称" allowClear />
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
                        dataSource={attachmentList}
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
                        <Column title="文件名称" dataIndex="filename" key="filename" align="center" width={220} ellipsis />
                        <Column
                            title="所属主题帖"
                            dataIndex="topicTitle"
                            key="topicTitle"
                            align="center"
                            width={220}
                            ellipsis
                            render={(text, record) =>
                                <Button type="link" onClick={() => handleToTopicItemInfo(record)}>{record.topicTitle}</Button>
                            } />
                        <Column title="板块名称" dataIndex="boardName" key="boardName" align="center" width={220} ellipsis />
                        <Column title="文件大小" dataIndex="fileSize" key="fileSize" align="center" width={90}
                            render={(text) => filesize(text)} />
                        <Column title="下载次数" dataIndex="downloadCount" key="downloadCount" align="center" width={90} />
                        <Column title="上传用户" dataIndex="uploaderUsername" key="uploaderUsername" align="center" width={180}
                            ellipsis
                            render={(text, record) =>
                                <Button type="link" onClick={() => handleToUserItemInfo(record.uploaderUserId)}>{text}</Button>
                            } />
                        <Column title="上传时间" dataIndex="uploadTime" key="uploadTime" align="center" width={180} />
                        <Column
                            title="操作"
                            key="action"
                            align="center"
                            width={120}
                            render={(text, record) => (
                                <>
                                    <span className="btn-option" onClick={() => handleToItemInfo(record)}>详情</span>

                                    <Divider type="vertical" />

                                    <span className="btn-option" onClick={() => handleItemDownload(record)}>下载</span>
                                </>
                            )}
                        />
                    </Table>
                </Card>

                <Modal
                    title="附件详情"
                    className="attachment-info-wrapper"
                    width={1200}
                    visible={modalVisible}
                    maskClosable={false}
                    onCancel={() => setModalVisible(false)}
                    footer={<Button type="primary" onClick={() => handleItemDownload(attachmentInfo)} >下载</Button>}
                >
                    <div>
                        <Descriptions bordered>
                            <Descriptions.Item label="文件名" span={2}>{attachmentInfo.filename}</Descriptions.Item>
                            <Descriptions.Item label="文件大小（字节）" span={1.5}>{attachmentInfo.fileSize}</Descriptions.Item>
                            <Descriptions.Item label="文件描述" span={3}>{attachmentInfo.description}</Descriptions.Item>
                            <Descriptions.Item label="所属主题帖" span={1.5}>{attachmentInfo.topicTitle}</Descriptions.Item>
                            <Descriptions.Item label="所属板块" span={1.5}>{attachmentInfo.boardName}</Descriptions.Item>
                            <Descriptions.Item label="下载地址" span={2}>{attachmentInfo.downloadUrl}</Descriptions.Item>
                            <Descriptions.Item label="下载次数" span={1}>{attachmentInfo.downloadCount}</Descriptions.Item>
                            <Descriptions.Item label="上传用户" span={1}>{attachmentInfo.uploaderUsername}</Descriptions.Item>
                            <Descriptions.Item label="上传用户Ip" span={1}>{attachmentInfo.uploaderIp}</Descriptions.Item>
                            <Descriptions.Item label="上传时间" span={1}>{attachmentInfo.uploadTime}</Descriptions.Item>
                        </Descriptions>
                    </div>
                </Modal>
            </ConfigProvider>
        </>
    )
}

export default AttachmentList
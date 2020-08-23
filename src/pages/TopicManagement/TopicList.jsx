import React, { useEffect, useState } from 'react'
import {
    Card, Table, message,
    Form, ConfigProvider, Button, Row, Col, AutoComplete, DatePicker,
    Cascader, Input, Badge, Select, Drawer
} from 'antd'
import { useHistory } from 'react-router-dom'
import zhCN from 'antd/es/locale/zh_CN';  // 引入中文包
import moment from 'moment'

import { debounce } from '../../utils/utils'
import topicApi from '../../api/topic'
import boardApi from '../../api/board'
import userApi from '../../api/user'
import { getData, postData } from '../../utils/apiMethods'

const { Column } = Table
const { Option } = Select
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


function TopicList() {

    const history = useHistory()

    const [searchForm] = Form.useForm();
    const [operationForm] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [drawerVisible, setDrawerVisible] = useState(false)
    const hasSelected = selectedRowKeys.length > 0

    const [autoCompleteList, setAutoCompleteList] = useState([])
    const [boardId, setBoardId] = useState([])
    const [username, setUsername] = useState('')
    const [keyword, setKeyword] = useState('')
    const [type, setType] = useState('')
    const [sort, setSort] = useState('')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    const [boardNameList, setBoardNameList] = useState([])
    const [topicList, setTopicList] = useState([])
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
            type: setType,
            sort: setSort,
            from: setFrom,
            to: setTo
        }
        return obj[property]
    }

    /**
     * 获取附件列表
     * @param {参数} params 
     */
    const getTopicList = (params = {}) => {
        getData(topicApi.getTopicList, params).then(result => {
            const { code, data } = result.data
            if (code !== 200) return message.error('')
            const { content, currentPage, pageSize, totalRecords } = data
            setTopicList(content)
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
     * 表单搜索事件
     * @param {表单值} values 
     */
    const handleSearch = values => {
        console.log(values);
        const params = {}
        for (let key in values) {
            if (values.hasOwnProperty(key)) {
                if (key === 'from' || key === 'to') {
                    if (values[key]) {
                        params[key] = moment(values[key]).format('YYYY-MM-DD hh:mm:ss')
                    }
                } else if (key === 'boardId') {
                    if (values[key]) {
                        params[key] = values[key][values[key].length - 1]
                    }
                } else {
                    params[key] = values[key]
                }
                commonSetter(key)(values[key])
            }
        }
        params.page = currentPage
        params.count = pageSize
        getTopicList(params)
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
            type,
            sort,
            from,
            to
        }
        searchForm.setFieldsValue(searchFormOldValue)
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
        getTopicList(params)
    }

    const handleToItemInfo = id => {
        history.push(`/admin/topic/id/${id}`)
    }


    /**
     * 表单重置事件
     */
    const handleReset = () => {
        setAutoCompleteList([])
        setBoardId([])
        setUsername('')
        setKeyword('')
        setType('')
        setSort('')
        setFrom('')
        setTo('')
        searchForm.resetFields()
    }

    /**
     * 操作表单确定事件
     */
    const handleDrawerConfirm = () => {
        operationForm.validateFields(['action', 'reason'])
            .then(res => {
                const { action, reason } = res
                postData(topicApi.manageTolic, {
                    idList: selectedRowKeys,
                    action,
                    reason
                }).then(result => {
                    const { code } = result.data
                    if (code !== 200) return message.error('')
                    getTopicList({
                        page: currentPage,
                        count: pageSize
                    })
                    setSelectedRowKeys([])
                    setDrawerVisible(false)
                    message.success('操作成功')
                })
            })
            .catch(error => {
                const { errorFields } = error
                const { errors } = errorFields[0]
                message.error(errors[0])
            })
    }

    /**
     * 去新建帖子页面
     */
    const handleItemInsert = () => {
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
        getTopicList({
            page: 1,
            count: 10
        })
    }, [])

    useEffect(() => {
        getBoardNameList()
    }, [])

    return (
        <>
            <ConfigProvider locale={zhCN}>
                <Card
                    title="帖子列表"
                    extra={<Button onClick={handleItemInsert}>新建帖子</Button>}>
                    <Form
                        form={searchForm}
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
                                    <Input placeholder="请输入关键名词" />
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

                            <Col span={6} >
                                <Form.Item name='type' label='帖子类型'>
                                    <Select placeholder="请选择帖子类型" allowClear>
                                        <Option value="normal">普通/精华</Option>
                                        <Option value="featured">精华</Option>
                                        <Option value="pinned">置顶</Option>
                                        <Option value="announcement">公告</Option>
                                    </Select>
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

                            <Col span={6} >
                                <Form.Item name='sort' label='排序方式' style={{ marginBottom: 0, width: 268 }}>
                                    <Select placeholder="请选择排序方式" allowClear>
                                        <Option value="submitTime">发帖时间</Option>
                                        <Option value="viewCount">浏览次数</Option>
                                        <Option value="replyCount">回复次数</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={6} style={{ textAlign: 'right' }}>
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
                            <Button type="primary" disabled={!hasSelected} onClick={() => setDrawerVisible(true)}>操作选中项</Button>
                        </Col>
                    </Row>

                    <Table
                        rowKey="id"
                        dataSource={topicList}
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
                            dataIndex="title"
                            key="title"
                            align="center"
                            ellipsis
                            render={(text, record) =>
                                <Button type="link" onClick={() => handleToItemInfo(record.id)}>{record.title}</Button>
                            } />
                        <Column title="发帖用户" dataIndex="submitterNickname" key="submitterNickname" align="center" width={180} ellipsis />
                        <Column title="分区名称" dataIndex="categoryName" key="categoryName" align="center" width={180} ellipsis />
                        <Column title="板块名称" dataIndex="boardName" key="boardName" align="center" width={180} ellipsis />
                        <Column
                            title="是否置顶"
                            dataIndex="pinned"
                            key="pinned"
                            align="center"
                            width={120}
                            render={pinned => {
                                return pinned ? <Badge status="processing" text="置顶" title="置顶" />
                                    : <Badge status="default" text="普通" title="普通" />
                            }} />
                        <Column
                            title="是否精华"
                            dataIndex="featured"
                            key="featured"
                            align="center"
                            width={120}
                            render={featured => {
                                return featured ? <Badge status="success" text="精华" title="精华" />
                                    : <Badge status="default" text="普通" title="普通" />
                            }} />
                        <Column title="浏览次数" dataIndex="viewCount" key="viewCount" align="center" width={90} />
                        <Column title="回复次数" dataIndex="replyCount" key="replyCount" align="center" width={90} />
                        <Column title="发贴时间" dataIndex="submitTime" key="submitTime" align="center" width={180} />
                    </Table>
                </Card>

            </ConfigProvider>

            <Drawer
                title="操作选中项"
                visible={drawerVisible}
                width={400}
                maskClosable={false}
                onClose={() => setDrawerVisible(false)}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>取消</Button>
                        <Button type="primary" onClick={handleDrawerConfirm}>提交</Button>
                    </div>
                }>

                <div style={{ marginBottom: 24 }}>
                    {hasSelected ? `当前已选中 ${selectedRowKeys.length} 项` : ''}
                </div>

                <Form
                    form={operationForm}
                    hideRequiredMark
                >
                    <Form.Item
                        label="操作类型"
                        name="action"
                        rules={[{ required: true, message: '请选择操作类型!' }]}
                    >
                        <Select placeholder="请选择操作类型" allowClear style={{ width: 150 }}>
                            <Option value="pin">置顶</Option>
                            <Option value="unpin">取消置顶</Option>
                            <Option value="feature">精华</Option>
                            <Option value="unfeature">取消精华</Option>
                            <Option value="delete">删除</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="操作原因"
                        name="reason"
                        rules={[{ required: true, message: '请输入操作原因!' },
                        { type: 'string', max: 200, message: '分区描述不能超过200个字符！' }]}
                    >
                        <Input.TextArea placeholder="请输入操作原因" autoSize={{ minRows: 2, maxRows: 6 }} />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    )
}

export default TopicList
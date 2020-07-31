import React from 'react'
import { Card, Table, Divider, Popconfirm, message, Menu, Dropdown } from 'antd'
import { useHistory } from 'react-router-dom'

const { Column } = Table

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
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
    })
}

function TopicList() {

    const history = useHistory()

    const handleToItemInfo = id => {
        history.push(`/admin/topic/id/${id}`)
    }

    const handleItemDelete = item => {
        message.success(`成功删除名称为 “${item.title}” 的主题帖！`)
    }

    return (
        <Card
            title="帖子列表">

            <Table
                rowKey="id"
                dataSource={data}
                expandable={{
                    expandedRowRender: record => <p style={{ margin: 0 }}>{record.title}</p>,
                    rowExpandable: record => record.name !== 'Not Expandable',
                }}
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
                <Column title="主题帖名称" dataIndex="title" key="title" align="center" width={180} ellipsis />
                <Column title="提交用户" dataIndex="submitter_user" key="submitter_user" align="center" width={180} ellipsis />
                <Column title="提交用户Ip" dataIndex="submitter_ip" key="submitter_ip" align="center" width={150} />
                <Column title="浏览次数" dataIndex="view_count" key="view_count" align="center" width={90} />
                <Column title="回复次数" dataIndex="reply_count" key="reply_count" align="center" width={90} />
                <Column title="最后编辑用户" dataIndex="editor_user" key="editor_user" align="center" width={180} ellipsis />
                <Column title="最后编辑用户Ip" dataIndex="editor_ip" key="editor_ip" align="center" width={150} />
                <Column title="最后编辑时间" dataIndex="edit_time" key="edit_time" align="center" width={180} />
                <Column
                    title="操作"
                    key="action"
                    align="center"
                    width={120}
                    render={(text, record) => (
                        <>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        <Menu.Item>
                                            <div>编辑</div>
                                        </Menu.Item>

                                        <Menu.Item>
                                            <div onClick={() => handleToItemInfo(record.id)}>详情</div>
                                        </Menu.Item>
                                    </Menu>}>
                                <span className="btn-option">更多</span>
                            </Dropdown>

                            <Divider type="vertical" />

                            <Popconfirm
                                title="删除后不可恢复，您确认删除本项吗？"
                                onConfirm={() => handleItemDelete(record)}
                                okText="是的！"
                                cancelText="我再想想..."
                            >
                                <span className="btn-option-danger">删除</span>
                            </Popconfirm>
                        </>
                    )}
                />
            </Table>
        </Card>
    )
}

export default TopicList
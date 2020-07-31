import React from 'react'
import { Card, Table, Divider, Popconfirm, message } from 'antd'

const { Column } = Table

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
        id: i,
        topic_name: `主题贴名称${i}`,
        content: `回复内容${i}`,
        reply_time: new Date().toLocaleString(),
        replier_user: `回复用户${i}`,
        replier_ip: '11.111.1111.11',
        edit_time: new Date().toLocaleString(),
        editor_user: `更新用户${i}`,
        editor_ip: '11.111.1111.11'
    })
}

function ReplyList() {

    const handleItemDelete = item => {
        console.log(item);
        message.success(`成功删除名称为 “${item.name}” 的板块！`)
    }

    return (
        <Card
            title="回复列表">

            <Table
                rowKey="id"
                dataSource={data}
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
                <Column title="主题帖名称" dataIndex="topic_name" key="topic_name" align="center" width={180} ellipsis/>
                <Column title="回复内容" dataIndex="content" key="content" align="center" ellipsis/>
                <Column title="回复用户" dataIndex="replier_user" key="replier_user" align="center" width={180} ellipsis/>
                <Column title="回复用户Ip" dataIndex="replier_ip" key="replier_ip" align="center" width={150}/>
                <Column title="回复时间" dataIndex="reply_time" key="reply_time" align="center" width={180}/>
                <Column title="更新用户" dataIndex="editor_user" key="editor_user" align="center" width={180} ellipsis/>
                <Column title="更新用户Ip" dataIndex="editor_ip" key="editor_ip" align="center" width={150}/>
                <Column title="更新时间" dataIndex="edit_time" key="edit_time" align="center" width={180}/>
                <Column
                    title="操作"
                    key="action"
                    align="center"
                    width={120}
                    render={(text, record) => (
                        <>
                            <span className="btn-option">修改</span>

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

export default ReplyList
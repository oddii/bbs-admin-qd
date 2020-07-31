import React from 'react'
import { Card, Table, Dropdown, Menu, Divider, Popconfirm, message } from 'antd'

import '../../index.scss'

const { Column } = Table

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
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

function AttachmentList() {

    const handleItemDelete = item => {
        message.success(`成功删除名称为 “${item.filename}” 的附件！`)
    }

    return (
        <Card
            title="附件列表">

            <Table
                rowKey="id"
                dataSource={data}
                expandable={{
                    expandedRowRender: record => <Card><span>描述：</span>{record.description}</Card>,
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
                <Column title="主题帖名称" dataIndex="topic_name" key="topic_name" align="center" width={180} ellipsis />
                <Column title="原始文件名" dataIndex="filename" key="filename" align="center" width={180} ellipsis />
                <Column title="文件路径" dataIndex="file_path" key="file_path" align="center" ellipsis />
                <Column title="文件大小" dataIndex="file_size" key="file_size" align="center" width={90} />
                <Column title="下载次数" dataIndex="download_count" key="download_count" align="center" width={90} />
                <Column title="上传用户" dataIndex="uploader_user" key="uploader_user" align="center" width={180} ellipsis />
                <Column title="上传用户Ip" dataIndex="uploader_ip" key="uploader_ip" align="center" width={150} />
                <Column title="上传时间" dataIndex="upload_time" key="upload_time" align="center" width={180} />
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
                                            <div>下载</div>
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

export default AttachmentList
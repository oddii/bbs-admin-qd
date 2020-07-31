import React from 'react'
import { Card, Table } from 'antd'
const { Column } = Table

const data = []
for (let i = 0; i < 10; i++) {
    data.push({
        id: i,
        name: `操作${i}`,
        operator_user: `操作用户${i}`,
        operator_ip: `11.11.11.11`,
        reason: `操作原因${i}`,
        operate_time: new Date().toLocaleString()
    })
}

function InfoOperationList(){
    return (
        <Card
            title="操作日志">
            
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
                <Column title="操作名称" dataIndex="name" key="name" align="center" width={180} ellipsis/>
                <Column title="操作原因" dataIndex="reason" key="reason" align="center" ellipsis/>
                <Column title="操作用户" dataIndex="operator_user" key="operator_user" align="center" width={180} ellipsis/>
                <Column title="操作用户Ip" dataIndex="operator_ip" key="operator_ip" align="center" width={150}/>
                <Column title="操作时间" dataIndex="operate_time" key="operate_time" align="center" width={180}/>
            </Table>
        </Card>
    )
}

export default InfoOperationList
import React, { useEffect, useState } from 'react'
import { Card, Table, message } from 'antd'

import operationApi from '../../api/operation'
import { getData } from '../../utils/apiMethods'

const { Column } = Table


function InfoOperationList() {

    const [operationList, setOperationList] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)

    const getOperationList = (params = {}) => {
        getData(operationApi.getOperationList, params)
            .then(result => {
                const { code, data } = result.data
                if (code !== 200) return message.error('')
                setOperationList(data.list)
                setCurrentPage(data.page)
                setPageSize(data.count)
                setTotal(data.total)
            })
    }

    useEffect(() => {
        getOperationList({
            page: currentPage,
            count: pageSize
        })
    }, [currentPage, pageSize])

    return (
        <Card
            title="操作日志">

            <Table
                rowKey="id"
                dataSource={operationList}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} items`,
                    onChange: (currentPage, pageSize) => getOperationList({ page: currentPage, count: pageSize })
                }}>
                <Column
                    title="#"
                    key="index"
                    align="center"
                    width={65}
                    render={(text, record, index) => index + 1} />
                <Column title="操作类型" dataIndex="type" key="type" align="center" width={180} ellipsis />
                <Column title="操作详情" dataIndex="detail" key="detail" align="center" ellipsis />
                <Column title="操作用户" dataIndex="operatorUsername" key="operatorUsername" align="center" width={180} ellipsis />
                <Column title="操作用户Ip" dataIndex="operatorIp" key="operatorIp" align="center" width={150} />
                <Column title="操作时间" dataIndex="operateTime" key="operateTime" align="center" width={180} />
            </Table>
        </Card>
    )
}

export default InfoOperationList
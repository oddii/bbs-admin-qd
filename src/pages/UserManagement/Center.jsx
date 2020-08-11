import React, { useState, useEffect } from 'react'
import { Card, Col, Row, Avatar, Tabs, List, Space, Tag, Button, message } from 'antd'
import { CloudOutlined, MessageOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { getData } from '../../utils/apiMethods'
import topicApi from '../../api/topic'
import replyApi from '../../api/reply'
import './index.scss'

const { TabPane } = Tabs;

const IconText = ({ icon, text }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

function Center() {

    const history = useHistory()

    const [topicList, setTopicList] = useState([])
    const [replyList, setReplyList] = useState([])

    /**
     * 获取指定用户的主题帖列表
     * @param {用户id} userId 
     * @param {主题帖类型} type 默认为 normal
     * normal=>普通主题+精华主题，featured=>精华主题，pinned=>置顶主题，announcement=>公告主题
     * @param {排序方式} sort 默认为 replyTime
     * replyTime=>最后回复时间，submitTime=>发帖时间，viewCount=>浏览次数，replyCount=>回复数
     * @param {页码} page 
     * @param {页面大小} count 上限20
     */
    const getTopicList = (
        userId = 123,
        type = 'normal',
        sort = 'replyTime',
        page = 1,
        count = 10
    ) => {
        getData(topicApi.getUserTopicList, {
            userId,
            type,
            sort,
            page,
            count
        }).then(result => {
            let { code, data } = result.data
            if (code !== 200) return message.error()
            data = data.map(item => {
                return Object.assign(item, {
                    description:
                        (item.type === 0 ? <Tag color="blue">普通帖子</Tag> : <Tag>公告</Tag>),
                    content:
                        (<>
                            <div>{item.shortContent}</div>
                            <div>
                                发布在<Button type="link">{item.boardName}</Button>板块，
                                <Button type="link">{item.categoryName}</Button>分区，<span>{item.submitTime}</span>
                            </div>
                        </>)
                })
            })
            setTopicList(data)
        })
    }

    /**
     * 获取指定用户的回复帖列表
     * @param {用户id} userId 
     * @param {页码} page 
     * @param {页面大小} count 上限20
     */
    const getReplyList = (
        userId = 123,
        page = 1,
        count = 10
    ) => {
        getData(replyApi.getUserReplyList, {
            userId,
            page,
            count
        }).then(result => {
            let { code, data } = result.data
            if (code !== 200) return message.error()
            data = data.map(item => {
                return Object.assign(item, {
                    content:
                        (<>
                            <div className="replyed-content">
                                {item.shortContent}
                                <div className="border-topleft"></div>
                                <div className="border-topleft2"></div>
                                <div className="border-bottomright"></div>
                                <div className="border-bottomright2"></div>
                            </div>
                            {/* <div className="reply-content">回贴内容：{item.shortContent}</div> */}
                            <div style={{ marginTop: 8 }}>回复时间：{item.replyTime}</div>
                        </>)
                })
            })
            setReplyList(data)
        })
    }

    const handleToItemInfo = id => {
        history.push(`/admin/topic/id/${id}`)
    }

    useEffect(() => {
        getTopicList()
        getReplyList()
    }, [])

    return (
        <Card
            title="个人中心"
            className="user-center-wrapper">
            <Row gutter={16}>
                {/* 左侧 */}
                <Col flex="0 1 300px" className="user-meta-wrapper">
                    <div className="user-meta">
                        <Avatar
                            className="meta-avatar"
                            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            size={120} />
                        <div className="meta-username">
                            odd
                        </div>
                        <div className="meta-signature">
                            这个人很懒，什么都没留下来
                        </div>
                    </div>
                </Col>

                {/* 右侧 */}
                <Col flex="1" className="user-extend-wrapper">
                    <Tabs defaultActiveKey="1" >

                        <TabPane tab="我的主题" key="1" >
                            <List
                                itemLayout="vertical"
                                size="large"
                                dataSource={topicList}
                                pagination={{
                                    total: 85,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `Total ${total} items`
                                }}
                                renderItem={item => (
                                    <List.Item
                                        key={item.id}
                                        actions={[
                                            <IconText icon={CloudOutlined} text={'浏览：' + item.viewCount} key="item-viewCount" />,
                                            <IconText icon={MessageOutlined} text={'回复：' + item.replyCount} key="item-replyCount" />,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<div
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToItemInfo(item.id)}>
                                                {item.title}
                                            </div>}
                                            description={item.description}
                                        />
                                        {item.content}
                                    </List.Item>
                                )}
                            />

                        </TabPane>

                        <TabPane tab="我的回复" key="2">
                            <List
                                itemLayout="vertical"
                                size="large"
                                dataSource={replyList}
                                pagination={{
                                    total: 85,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `Total ${total} items`
                                }}
                                renderItem={item => (
                                    <List.Item
                                        key={item.id}
                                    >
                                        <List.Item.Meta
                                            style={{ marginBottom: 8 }}
                                            title={<div
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleToItemInfo(item.topicId)}>
                                                {item.topicTitle}
                                            </div>}
                                        />
                                        {item.content}
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                        <TabPane tab="我的收藏" key="3">
                            功能完善中...
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        </Card>
    )
}

export default Center
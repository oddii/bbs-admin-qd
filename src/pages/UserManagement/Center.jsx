import React from 'react'
import { Card, Col, Row, Avatar, Tabs, List, Space, Tag, Button } from 'antd'
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons'

import './index.scss'
const { TabPane } = Tabs;

const listData = [];
for (let i = 1; i <= 10; i++) {
    listData.push({
        title: `帖子${i}`,
        description:
            (<Tag>帖子</Tag>),
        content:
            (<>
                <div>
                    段落示意：蚂蚁金服设计平台 ant.design，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。蚂蚁金服设计平台 ant.design，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。
                </div>
                <div>
                    发布在<Button type="link">分区1</Button> 所属<Button type="link">板块1</Button> <span>2020-07-23 09:41</span>
                </div>
            </>)
    });
}

const replyListData = []
for(let i =1;i<=10;i++){
    replyListData.push({
        key:`${i}`,
        title:(<div>帖子{i}</div>),
        content:
            (<>
                <div className="replyed-content">
                段落示意：蚂蚁金服设计平台 ant.design，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。蚂蚁金服设计平台 ant.design，用最小的工作量，无缝接入蚂蚁金服生态，提供跨越设计与开发的体验解决方案。
                <div className="border-topleft"></div>
                <div className="border-topleft2"></div>
                <div className="border-bottomright"></div>
                <div className="border-bottomright2"></div>
                </div>
                <div className="reply-content">
                    回贴内容{i}
                </div>
                <div>
                    2020-07-23 09:41
                </div>
            </>)
    })
}

const IconText = ({ icon, text }) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

function Center() {
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

                        <TabPane tab="我的主题" key="1">
                            <List
                                itemLayout="vertical"
                                size="large"
                                dataSource={listData}
                                renderItem={item => (
                                    <List.Item
                                        key={item.title}
                                        actions={[
                                            <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                                            <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                                            <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={item.title}
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
                                dataSource={replyListData}
                                renderItem={item => (
                                    <List.Item
                                        key={item.key}
                                   >
                                        <List.Item.Meta
                                            title={item.title}
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
import React from 'react'
import { Layout, Result, Button } from 'antd';
import { useHistory } from 'react-router-dom'
import Footer from '../../Layout/components/Footer'

import './index.scss'

const { Header, Content } = Layout;

function NotFound() {

    const history = useHistory()

    return (
        <Layout className="notfound-wrapper">
            <Header className="notfound-header" />
            <Content>
                <Result
                    status="404"
                    title="404"
                    subTitle="肥肠抱歉，您找的页面不见了"
                    extra={<Button type="primary" onClick={() => history.goBack()}> 返回上一页</Button>}
                />
            </Content>
            <Footer />
        </Layout>
    )
}

export default NotFound
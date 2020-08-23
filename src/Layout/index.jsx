import React, { useEffect, useState } from 'react'
import { Layout as AntdLayout, Breadcrumb, message } from 'antd';
import { SnippetsOutlined, FileOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import userApi from '../api/user'
import { getData } from '../utils/apiMethods'
import { ACTIONS } from '../constant'

import Header from './components/Header'
import Footer from './components/Footer'
import Sider from './components/Sider'
import './index.scss'

import { adminRoutes } from '../routes'
import { useCallback } from 'react';

const { Content } = AntdLayout;

function Layout(props) {

    const history = useHistory()
    const dispatch = useDispatch()
    const user = useSelector(state => state.userReducer)

    const [userId] = useState(localStorage.getItem('userId'))
    const [pathname, setPathname] = useState(history.location.pathname)
    const [breadcrumbList, setBreadcrumbList] = useState([])

    /**
     * @method 改变面包屑的值
     */
    const handleBreadcrumbChange = (pathname) => {

        let list = []
        if (!pathname.includes('/admin/topic/id/')) {

            adminRoutes.forEach(item => {
                if (item.path === pathname) {
                    list.push(item)
                } else {
                    if (item.children) {
                        item.children.forEach(children => {
                            if (children.path === pathname) {
                                list.push(item)
                                list.push(children)
                            }
                        })
                    }
                }
            })
        } else {
            list.push({ path: '/admin/topic', title: '帖子管理', icon: SnippetsOutlined })
            list.push({ path: pathname, title: '帖子详情', icon: FileOutlined })
        }
        setBreadcrumbList(list)
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = userId => {
        if (!userId) {
            message.error('您尚未登录，请先登录再继续操作')
            return history.push('/login')
        } else {
            getData(userApi.getUserInfo, userId).then(result => {
                const { code, data } = result.data
                if (code !== 200) return message.error('')
                dispatch({ type: ACTIONS.SET_USER_DATA, user: data })
                console.log(user);
            })
        }
    }

    useEffect(() => {
        setPathname(history.location.pathname)
    }, [history.location.pathname])

    useEffect(() => {
        handleBreadcrumbChange(pathname)
    }, [pathname])

    return (
        <AntdLayout className="layout-wrapper">
            <Header />

            <Content style={{ padding: '0 50px' }}>
                {/* 面包屑 */}
                <Breadcrumb style={{ marginTop: '24px' }} >
                    {breadcrumbList.map(item => <Breadcrumb.Item key={item.path}><item.icon /> {item.title}</Breadcrumb.Item>)}
                </Breadcrumb>

                <AntdLayout style={{ padding: '24px 0 0 0' }}>
                    {/* 侧边栏 */}
                    <Sider />

                    <Content style={{ padding: '0 24px', minHeight: 713 }}>
                        {props.children}
                    </Content>
                </AntdLayout>
            </Content>

            <Footer />

        </AntdLayout >
    )
}

export default Layout
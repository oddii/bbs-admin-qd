import React, { useEffect, useState, useCallback } from 'react'
import { Layout as AntdLayout, Breadcrumb, message } from 'antd';
import {
    SnippetsOutlined, FileOutlined, UserOutlined, TeamOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import userApi from '../api/user'
import { getData } from '../utils/apiMethods'
import { ACTIONS } from '../constant'

import Header from './components/Header'
import Footer from './components/Footer'
import Sider from './components/Sider'
import './index.scss'

import { adminRoutes } from '../routes'

const { Content } = AntdLayout;

function Layout(props) {

    const history = useHistory()
    const dispatch = useDispatch()
    const [refresh, setRefresh] = useState(false)

    const [pathname, setPathname] = useState(history.location.pathname)
    const [breadcrumbList, setBreadcrumbList] = useState([])

    /**
     * @method 改变面包屑的值
     */
    const handleBreadcrumbChange = (pathname) => {

        let list = []

        if (pathname.includes('/admin/topic/id/')) {
            list.push(
                { path: '/admin/topic', title: '帖子管理', icon: SnippetsOutlined },
                { path: pathname, title: '帖子详情', icon: FileOutlined })
        } else if (pathname.includes('/admin/user/center/')) {
            list.push(
                { path: '/admin/user', title: '用户管理', icon: TeamOutlined },
                { path: pathname, title: '用户中心', icon: UserOutlined })
        } else if (pathname.includes('/admin/user/settings/')) {
            list.push(
                { path: '/admin/user', title: '用户管理', icon: TeamOutlined },
                { path: pathname, title: '用户设置', icon: SettingOutlined })
        } else {
            adminRoutes.forEach(item => {
                if (item.path === pathname) {
                    list.push(item)
                } else {
                    if (item.children) {
                        item.children.forEach(children => {
                            if (children.path === pathname) {
                                list.push(item, children)
                            }
                        })
                    }
                }
            })
        }
        setBreadcrumbList(list)
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = useCallback(id => {
        if (!id) {
            message.error('您尚未登录，请先登录再继续操作')
            return history.push('/login')
        } else {
            getData(userApi.getUserList, { userId: id, page: 1, count: 1 }).then(async result => {
                const { code, data, msg } = await result.data
                if (code !== 200) return message.error(msg)
                const { content } = data
                dispatch({ type: ACTIONS.SET_USER_DATA, user: content[0] })

                setRefresh(true)
            }).catch(error => {
                message.error('请检查网络状态！')
                return history.push('/login')
            })
        }
    }, [dispatch, history])

    useEffect(() => {
        setPathname(history.location.pathname)
    }, [history.location.pathname])

    useEffect(() => {
        handleBreadcrumbChange(pathname)
    }, [pathname])

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        getUserInfo(userId)
    }, [getUserInfo])

    return (
        <AntdLayout className="layout-wrapper">
            <Header refresh={refresh} />

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
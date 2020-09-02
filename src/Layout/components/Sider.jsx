import React from 'react'
import { Layout, Menu, message } from 'antd'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { adminRoutes } from '../../routes'
const routes = adminRoutes.filter(route => route.isNav)
//  默认展开菜单
const defaultOpenKeys = []
routes.forEach(item => {
    if (item.children) defaultOpenKeys.push(item.path)
})

const { Sider: AntdSider } = Layout
const { SubMenu } = Menu

function Sider() {

    const history = useHistory()
    const { pathname } = history.location

    const localUserInfo = useSelector(state => state.userReducer)
    const isCollapsed = useSelector(state => state.commonReducer.isCollapsed)

    const handleMenuClick = ({ key }) => {
        switch (key) {
            case '/admin/topic/attachment':
            case '/admin/user/list':
            case '/admin/info/link':
            case '/admin/info/operation':
                if (!localUserInfo.admin) {
                    return message.error('您为获得访问该页面的权限！')
                }
                return history.push({ pathname: key })
            default:
                return history.push({ pathname: key })
        }
    }

    return (
        <AntdSider
            width={200}
            collapsed={isCollapsed}
            theme="light"
            style={{ height: '100%' }}>
            <Menu
                mode="inline"
                selectedKeys={[pathname]}
                defaultOpenKeys={defaultOpenKeys}
                onClick={handleMenuClick}
                style={{ height: '100%' }}
            >
                {
                    routes.map(route => {
                        return route.children
                            ? <SubMenu
                                key={route.path}
                                title={route.title}
                                icon={<route.icon />}>
                                {
                                    route.children.map(children => {
                                        return children.isNav
                                            ? <Menu.Item
                                                key={children.path}
                                                title={children.title}
                                                icon={<children.icon />} >
                                                {children.title}
                                            </Menu.Item>
                                            : null
                                    })
                                }
                            </SubMenu>
                            : <Menu.Item
                                key={route.path}
                                title={route.title}
                                icon={<route.icon />} >
                                {route.title}
                            </Menu.Item>
                    })
                }
            </Menu>
        </AntdSider>
    )
}

export default Sider
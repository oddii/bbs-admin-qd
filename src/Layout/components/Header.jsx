import React, { } from 'react'
import { Layout as AntdLayout, Avatar, Dropdown, message, Menu, Tooltip } from 'antd'
import { UserOutlined, RollbackOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import userApi from '../../api/user'
import { postData } from '../../utils/apiMethods'
import { ACTIONS, CONFIG } from '../../constant'
import Logo from '../../assets/images/logo.svg'



const { Header: AntdHeader } = AntdLayout

function Header() {

    const history = useHistory()
    const dispatch = useDispatch()
    const isCollapsed = useSelector(state => state.commonReducer.isCollapsed)
    const userInfo = useSelector(state => state.userReducer)

    /**
     * @method 信息栏Dropdown菜单点击事件
     * @param {键} key  
     */
    const handleDropdownMenuOnClick = ({ key }) => {
        const userId = localStorage.getItem('userId')
        switch (key) {
            case 'center':
                history.push(`/admin/user/center/${userId}`)
                break
            case 'settings':
                history.push(`/admin/user/settings/${userId}`)
                break
            case 'logout':
                postData(userApi.logout).then(async result => {
                    const { code } = await result.data
                    if (code === 200) {
                        message.success('退出成功！')
                        localStorage.removeItem('userId')
                        history.push('/login')
                    } else {
                        message.error('退出失败！')
                    }
                })
                break
            default:
                message.info('你点击了' + key + '按钮')
                break
        }
    }

    /**
     * 信息栏Dropdown菜单
     */
    const dropdownMenu = (
        <Menu onClick={handleDropdownMenuOnClick}>
            <Menu.Item key="center"><UserOutlined /> 个人中心</Menu.Item>
            {
                userInfo.admin
                    ? <Menu.Item key="settings"><SettingOutlined /> 个人设置</Menu.Item>
                    : null
            }
            <Menu.Divider />
            <Menu.Item key="logout"><RollbackOutlined /> 退出登录</Menu.Item>
        </Menu>
    )

    /**
     * @method 改变侧边栏折叠/展开状态
     */
    const handleCollapsedChange = () => {
        dispatch({ type: ACTIONS.HANDLE_COLLAPSED })
    }

    return (
        <AntdHeader className="header-wrapper">
            <div className="header-logo" >
                <img src={Logo} alt="" />
            </div>

            <div className="header-right">
                <div className="header-btn-wrapper">
                    <Tooltip title={!isCollapsed ? '折叠菜单' : '展开菜单'}>
                        <div className="btn-collapsed" onClick={handleCollapsedChange}>
                            {!isCollapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                        </div>
                    </Tooltip>
                </div>
                <div className="header-role">
                    {
                        userInfo.admin
                            ? '管理员'
                            : userInfo.superBoardAdmin
                                ? '超级版主'
                                : userInfo.categoryAdmin
                                    ? '分区版主'
                                    : userInfo.boardAdmin
                                        ? '板块版主'
                                        : ''
                    }
                </div>
                <Dropdown
                    overlay={dropdownMenu}
                    placement="bottomCenter"
                    arrow>
                    <div className="header-meta">
                        <Avatar src={
                            userInfo.avatarPath
                                ? CONFIG.baseUrl + userInfo.avatarPath.substring(1, userInfo.avatarPath.length)
                                : null} />
                        <div className="meta-usename">
                            {userInfo.nickname}
                        </div>
                    </div>
                </Dropdown>

            </div>
        </AntdHeader>
    )
}

export default Header
import loadable from 'react-loadable'
import Loading from '../components/Loading'

import Login from '../pages/Login'
import NotFound from '../pages/Exception/NotFound'

import {
    DesktopOutlined,
    TeamOutlined,
    UserOutlined,
    SettingOutlined,
    ToolOutlined,
    LinkOutlined,
    LayoutOutlined,
    ProfileOutlined,
    SnippetsOutlined,
    FileZipOutlined,
    FileOutlined,
    FormOutlined
} from '@ant-design/icons'

const DashBoard = loadable({
    loader: () => import('../pages/Dashboard'),
    loading: Loading
})

const TopicList = loadable({
    loader: () => import('../pages/TopicManagement/TopicList.jsx'),
    loading: Loading
})

const TopicInfo = loadable({
    loader: () => import('../pages/TopicManagement/TopicInfo.jsx'),
    loading: Loading
})

const TopicEdit = loadable({
    loader: () => import('../pages/TopicManagement/TopicEdit.jsx'),
    loading: Loading
})

const ReplyList = loadable({
    loader: () => import('../pages/TopicManagement/ReplyList.jsx'),
    loading: Loading
})

const AttachmentList = loadable({
    loader: () => import('../pages/TopicManagement/AttachmentList.jsx'),
    loading: Loading
})

const BoardList = loadable({
    loader: () => import('../pages/BoardManagement/BoardList.jsx'),
    loading: Loading
})

const CategoryList = loadable({
    loader: () => import('../pages/BoardManagement/CategoryList.jsx'),
    loading: Loading
})

const UserList = loadable({
    loader: () => import('../pages/UserManagement/UserList.jsx'),
    loading: Loading
})

const UserCenter = loadable({
    loader: () => import('../pages/UserManagement/Center.jsx'),
    loading: Loading
})

const UserSettings = loadable({
    loader: () => import('../pages/UserManagement/Settings.jsx'),
    loading: Loading
})

const InfoLinkList = loadable({
    loader: () => import('../pages/InfoManagement/LinkList.jsx'),
    loading: Loading
})


export const mainRoutes = [{
    path: '/login',
    component: Login
}, {
    path: '/404',
    component: NotFound
}]

export const adminRoutes = [{
    path: '/admin/dashboard',
    component: DashBoard,
    exact: true,
    isNav: true,
    title: '仪表盘',
    icon: DesktopOutlined
}, {
    path: '/admin/topic',
    exact: true,
    isNav: true,
    title: '帖子管理',
    icon: SnippetsOutlined,
    children: [{
            path: '/admin/topic/list',
            component: TopicList,
            exact: true,
            isNav: true,
            title: '帖子列表',
            icon: ProfileOutlined
        }, {
            path: '/admin/topic/reply',
            component: ReplyList,
            exact: true,
            isNav: true,
            title: '回复列表',
            icon: ProfileOutlined
        }, {
            path: '/admin/topic/attachment',
            component: AttachmentList,
            exact: true,
            isNav: true,
            title: '附件列表',
            icon: FileZipOutlined
        }, {
            path: '/admin/topic/id/:id',
            component: TopicInfo,
            exact: true,
            isNav: false,
            title: '帖子详情',
            icon: FileOutlined
        },
        {
            path: '/admin/topic/edit/:id?',
            component: TopicEdit,
            exact: true,
            isNav: false,
            title: '新建帖子',
            icon: FormOutlined
        }
    ]
}, {
    path: '/admin/board',
    exact: true,
    isNav: true,
    title: '版块管理',
    icon: LayoutOutlined,
    children: [{
        path: '/admin/board/list',
        component: BoardList,
        exact: true,
        isNav: true,
        title: '板块列表',
        icon: ProfileOutlined
    }, {
        path: '/admin/board/category',
        component: CategoryList,
        exact: true,
        isNav: true,
        title: '分区列表',
        icon: ProfileOutlined
    }]
}, {
    path: '/admin/user',
    exact: true,
    isNav: true,
    title: '用户管理',
    icon: TeamOutlined,
    children: [{
            path: '/admin/user/list',
            component: UserList,
            exact: true,
            isNav: true,
            title: '用户列表',
            icon: ProfileOutlined
        }, {
            path: '/admin/user/center/:id',
            component: UserCenter,
            exact: true,
            isNav: false,
            title: '个人中心',
            icon: UserOutlined
        },
        {
            path: '/admin/user/settings/:id',
            component: UserSettings,
            exact: true,
            isNav: false,
            title: '个人设置',
            icon: SettingOutlined
        }
    ]
}, {
    path: '/admin/info',
    exact: true,
    isNav: true,
    title: '网站信息管理',
    icon: ToolOutlined,
    children: [{
        path: '/admin/info/link',
        component: InfoLinkList,
        exact: true,
        isNav: true,
        title: '友链列表',
        icon: LinkOutlined
    }]
}]
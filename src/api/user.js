export default {
    refreshCode: '/api/verifycode/refresh-code', //  获取验证码
    login: '/api/user/login', //  用户登录
    register: '/api/user/register', //  用户注册
    sendEmailVerifyCode: '/api/user/send-email-verify-code', //  发送邮件验证码
    resetPassword: '/api/user/reset-password', //  用户找回密码
    getUserInfo: '/api/user/user-info', //  获取用户信息
    updateUserInfo: '/api/user/update-user-info', //  修改用户信息
    updateUserAvatar: '/api/user/update-avatar', // 修改用户头像
    updateUserPassword: '/api/user/update-password', //  修改用户密码
    verifyEmail: '/api/user/verify-email', //  用户激活邮箱
    updateUserEmail: '/api/user/update-email', //  用户修改邮箱
    getUserBoardPermission: '/api/user/board-permission', //  获取用户在指定板块的权限
    getUserList: '/api/user/user-list', //  获取用户列表
    getUsernameList: '/api/user/username-list', //  获取用户名列表（有问题）
    addUser: '/api/user/add-user', //   添加用户
    delUser: '/api/user/delete-user', //  删除用户
    addBoardAdmin: '/api/user/add-board-admin', //  添加版主
    delBoardAdmin: '/api/user/delete-board-admin', //  删除版主
    addCategoryAdmin: '/api/user/add-category-admin', //  添加分区版主
    delCategoryAdmin: '/api/user/delete-category-admin', //  删除分区版主
    addSuperBoardAdmin: '/api/user/add-super-board-admin', //  添加超级版主
    delSuperBoardAdmin: '/api/user/delete-super-board-admin', //  删除超级版主
    updateUserForumPermission: '/api/user/update-forum-permission', //  修改用户论坛权限
    updateUserBoardPermission: '/api/user/update-board-permission' //  修改用户板块权限
}
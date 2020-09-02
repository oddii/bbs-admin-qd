export default {
    getTopicInfo: '/api/topic/topic-detail', //  根据 id 获得指定帖子信息
    getBoardTopicList: '/api/topic/board-topic-list', //  获取指定板块的主题帖列表
    getUserTopicList: '/api/topic/user-topic-list', //  获取指定用户的主题帖列表
    getTopicList: '/api/topic/topic-list', //  获取所有主题帖列表
    getTopicDetail: '/api/topic/topic-detail', //  获取主题帖详细信息
    addTopic: '/api/topic/add-topic', //  添加主题帖
    delTolic: '/api/topic/delete-topic', //  删除主题帖
    updateTolic: '/api/topic/update-topic', //  修改主题帖
    manageTolic: '/api/topic/manage-topic', //  主题帖管理（单个+批量）
    getTopicReplyList: '/api/reply/topic-reply-list', //  获取指定主题帖的回复帖
    getTopicOperation: '/api/topic/topic-operation-log' //  获取主题帖操纵记录
}
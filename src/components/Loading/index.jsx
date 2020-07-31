import React from 'react'
import { Spin } from 'antd'

import './index.scss'

function Loading() {
    return (
        <div className="loading-wrapper">
            <Spin
                tip="加载组件中..."
                size="large" />
        </div>

    )
}

export default Loading
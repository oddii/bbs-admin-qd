import React from 'react'
import { Layout as AntdLayout } from 'antd'

import './index.scss'

const { Footer: AntdFooter } = AntdLayout

function Header() {
    return (
        <AntdFooter className="footer-wrapper">
            <div>9组 橡皮人雷欧弟 组长：范育铭 @2020 Created By odd</div>
        </AntdFooter>
    )
}

export default Header
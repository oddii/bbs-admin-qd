import React from 'react'
import { Layout as AntdLayout } from 'antd'

import './index.scss'

const { Footer: AntdFooter } = AntdLayout

function Header() {
    return (
        <AntdFooter className="footer-wrapper">
            <div>
                Ant Design ©2018 Created by Ant UED
            </div>
        </AntdFooter>
    )
}

export default Header
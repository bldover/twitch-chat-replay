import { FC, ReactNode, useState } from 'react'
import { InfoIcon } from './Icons'
import './InfoTooltip.css'

type InfoTooltipProps = {
    children: ReactNode
}

export const InfoTooltip: FC<InfoTooltipProps> = ({ children }) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div
            className='info-icon-container'
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <InfoIcon className='info-icon' />
            {showTooltip && (
                <div className='tooltip'>
                    <div className='tooltip-content'>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}
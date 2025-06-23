import './SettingItem.css';
import { FC, ReactNode } from 'react';
import { InfoTooltip } from '../common/InfoTooltip';

interface SettingItemProps {
    name: string;
    description?: string;
    children: ReactNode;
    showGlow?: boolean;
}

const SettingItem: FC<SettingItemProps> = ({ name, description, children, showGlow = true }) => {
    return (
        <div className='setting-item'>
            <div className='setting-label'>
                <span className='setting-name'>
                    {name}
                </span>
                {description && (
                    <InfoTooltip>
                        {description}
                    </InfoTooltip>
                )}
            </div>
            <div className={`setting-selector ${showGlow ? 'setting-selector-glow' : ''}`}>
                {children}
            </div>
        </div >
    );
};

export default SettingItem;

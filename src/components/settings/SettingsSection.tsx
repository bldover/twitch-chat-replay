import { FC, ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
}

const SettingsSection: FC<SettingsSectionProps> = ({ title, description, children }) => {
    return (
        <div className='settings-section'>
            <h4>{title}</h4>
            {description && (
                <p className='settings-section-description'>
                    {description}
                </p>
            )}
            {children}
        </div>
    );
};

export default SettingsSection;
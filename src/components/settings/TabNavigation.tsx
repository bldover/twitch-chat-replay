import './TabNavigation.css';
import { FC } from 'react';

export interface Tab {
    id: string;
    label: string;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className='tab-navigation'>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
import { FC, useMemo } from 'react';
import ExpandableChecklist, { ChecklistOption } from './ExpandableChecklist';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';

interface BadgeSettingsProps {
    value: BadgeSettingsType;
    onChange: (key: keyof BadgeSettingsType) => void;
}

const BadgeSettings: FC<BadgeSettingsProps> = ({ value, onChange }) => {
    const options: ChecklistOption[] = useMemo(() => [
        {
            key: 'showUserStates',
            label: 'User Types',
            checked: value.showUserStates
        },
        {
            key: 'showDonations',
            label: 'Donations',
            checked: value.showDonations
        },
        {
            key: 'showSubTiers',
            label: 'Sub Tiers',
            checked: value.showSubTiers
        },
        {
            key: 'showPredictions',
            label: 'Predictions',
            checked: value.showPredictions
        },
        {
            key: 'showEvents',
            label: 'Events',
            checked: value.showEvents
        }
    ], [value]);

    const handleChecklistChange = (key: string) => {
        onChange(key as keyof BadgeSettingsType);
    };

    return (
        <ExpandableChecklist
            options={options}
            onChange={handleChecklistChange}
        />
    );
};

export default BadgeSettings;

import './ChatSelector.css'
import { FC } from 'react'
import { VodSummary } from '../../types'

interface ChatSelectorProps {
    vodSummaries: VodSummary[]
    onSelectKnownJson: (summary: VodSummary) => void
    showMatchScores?: boolean
}

const ChatSelector: FC<ChatSelectorProps> = ({ vodSummaries, onSelectKnownJson, showMatchScores = false }) => {

    const getButtonText = function (summary: VodSummary) {
        const hasMatchScore = typeof summary.matchScore === 'number'

        return <>
            <p className='chat-selection-button-title'>{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
            {showMatchScores && hasMatchScore && (
                <p className='match-score'>Match: {summary.matchScore}%</p>
            )}
        </>
    }

    return (
        <>
            {vodSummaries &&
                <div className='chat-selector'>
                    {vodSummaries.map((summary) =>
                        <button
                            key={summary.id}
                            className={'chat-selection-button'}
                            onClick={() => onSelectKnownJson(summary)}
                        >
                            {getButtonText(summary)}
                        </button>
                    )}
                </div>
            }
        </>
    )
}

export default ChatSelector

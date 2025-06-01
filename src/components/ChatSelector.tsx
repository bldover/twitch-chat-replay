import './ChatSelector.css'
import { FC } from 'react'
import { getChatSelectionMode } from '../utils/settings'
import { filterAndRankChatOptions } from '../utils/chatMatcher'
import { VodSummary, VideoMetadata } from '../types'

interface ChatSelectorProps {
    vodSummaries: VodSummary[]
    onSelectKnownJson: (summary: VodSummary) => void
    videoMetadata: VideoMetadata | null
    searchFilter?: string
}

const ChatSelector: FC<ChatSelectorProps> = ({ vodSummaries, onSelectKnownJson, videoMetadata, searchFilter = '' }) => {

    const filterFunction = function (summary: VodSummary): boolean {
        const videoTitle = summary.title.toLowerCase()
        const parts = searchFilter.toLowerCase().split(' ')
        return parts.every((part) => videoTitle.includes(part))
    }

    const getFilteredAndRankedSummaries = (): VodSummary[] => {
        if (!vodSummaries) return []

        const isAutoSearchMode = getChatSelectionMode() === 'automatic-search'

        if (searchFilter.length === 0 && isAutoSearchMode && videoMetadata) {
            return filterAndRankChatOptions(videoMetadata, vodSummaries)
        } else {
            return vodSummaries.filter(filterFunction)
        }
    }

    const getButtonText = function (summary: VodSummary) {
        const isAutoSearchMode = getChatSelectionMode() === 'automatic-search'
        const hasMatchScore = typeof summary.matchScore === 'number'

        return <>
            <p className='chat-selection-button-title'>{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
            {isAutoSearchMode && hasMatchScore && (
                <p className='match-score'>Match: {summary.matchScore}%</p>
            )}
        </>
    }

    const filteredSummaries = getFilteredAndRankedSummaries()
    const isAutoSearchMode = getChatSelectionMode() === 'automatic-search'
    const shouldShowNoMatchMessage = vodSummaries &&
        filteredSummaries.length === 0 &&
        searchFilter.length === 0 &&
        isAutoSearchMode &&
        videoMetadata

    return (
        <>
            {vodSummaries &&
                <div className='chat-selector'>
                    {shouldShowNoMatchMessage ? (
                        <div className='no-match-message'>
                            Unable to find any corresponding chats :(
                        </div>
                    ) : (
                        filteredSummaries.map((summary) =>
                            <button
                                key={summary.id}
                                className={'chat-selection-button'}
                                onClick={() => onSelectKnownJson(summary)}
                            >
                                {getButtonText(summary)}
                            </button>
                        )
                    )}
                </div>
            }
        </>
    )
}

export default ChatSelector

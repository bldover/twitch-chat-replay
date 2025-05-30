import './ChatSelector.css'
import { useState, useEffect, FC } from 'react'
import { getQueryParam } from '../utils/queryParams'
import { filterAndRankChatOptions } from '../utils/chatMatcher'
import { VodSummary, VideoMetadata, ChatData } from '../types'

interface ChatSelectorProps {
    onSelectKnownJson: (summary: VodSummary) => void;
    onUploadCustomJson: (json: ChatData) => void;
    videoMetadata: VideoMetadata | null;
    searchFilter?: string;
}

const ChatSelector: FC<ChatSelectorProps> = ({ onSelectKnownJson, onUploadCustomJson, videoMetadata, searchFilter = '' }) => {
    const [summaries, setSummaries] = useState<VodSummary[]>()

    useEffect(() => {
        if (!summaries) {
            fetch('/content/vod-summaries.json')
                .then((response) => {
                    response.json().then(s => setSummaries(s))
                        .catch(reason => {
                            console.log('Converting summaries to json failed: ' + reason)
                        })
                }).catch(reason => {
                    console.log('Fetching summaries failed: ' + reason)
                })
        }
    })

    const filterFunction = function (summary: VodSummary): boolean {
        const videoTitle = summary.title.toLowerCase()
        const parts = searchFilter.toLowerCase().split(' ')
        return parts.every((part) => videoTitle.includes(part))
    }

    const getFilteredAndRankedSummaries = (): VodSummary[] => {
        if (!summaries) return []

        const isAutoSelectMode = getQueryParam('chatAutoSelect') === 'true'

        if (searchFilter.length === 0 && isAutoSelectMode && videoMetadata) {
            return filterAndRankChatOptions(videoMetadata, summaries)
        } else {
            return summaries.filter(filterFunction)
        }
    }

    const getButtonText = function (summary: VodSummary) {
        const isAutoSelectMode = getQueryParam('chatAutoSelect') === 'true'
        const hasMatchScore = typeof summary.matchScore === 'number'

        return <>
            <p className='chat-selection-button-title'>{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
            {isAutoSelectMode && hasMatchScore && (
                <p className='match-score'>Match: {summary.matchScore}%</p>
            )}
        </>
    }

    const filteredSummaries = getFilteredAndRankedSummaries()

    return (
        <>
            {summaries &&
                <div className='chat-selector'>
                    {filteredSummaries.map((summary) =>
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

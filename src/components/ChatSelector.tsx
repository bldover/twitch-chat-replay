import './ChatSelector.css'
import { useState, useEffect, FC } from 'react'
import { getChatSelectionMode } from '../utils/settings'
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

        const isAutoSearchMode = getChatSelectionMode() === 'automatic-search'

        if (searchFilter.length === 0 && isAutoSearchMode && videoMetadata) {
            return filterAndRankChatOptions(videoMetadata, summaries)
        } else {
            return summaries.filter(filterFunction)
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
    const shouldShowNoMatchMessage = summaries &&
        filteredSummaries.length === 0 &&
        searchFilter.length === 0 &&
        isAutoSearchMode &&
        videoMetadata

    return (
        <>
            {summaries &&
                <div className='chat-selector'>
                    {shouldShowNoMatchMessage ? (
                        <div className='no-match-message'>
                            Unable to find any corresponding chats :( Is the video from a NL Twitch VOD after 3/4/2016?
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

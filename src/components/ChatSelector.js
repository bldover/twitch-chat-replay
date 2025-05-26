import './ChatSelector.css'
import React, {useState, useEffect} from 'react'
import { getQueryParam } from '../utils/queryParams'
import { filterAndRankChatOptions } from '../utils/chatMatcher'

const SEARCH_PROMPT = "Search for NL vods here!";

const ChatSelector = ({onSelectKnownJson, onUploadCustomJson, videoMetadata}) => {
    const [currentFilter, setCurrentFilter] = useState("")
    const [summaries, setSummaries] = useState()

    useEffect(() => {
        if (!summaries) {
            fetch("/content/vod-summaries.json")
                .then((response) => {
                    response.json().then(s => setSummaries(s))
                    .catch(reason => {
                        console.log("Converting summaries to json failed: " + reason)
                    })
                }).catch(reason => {
                console.log("Fetching summaries failed: " + reason)
                }
            )
        }
    })

    const filterFunction = function (summary) {
        const videoTitle = summary.title.toLowerCase()
        const parts = currentFilter.toLowerCase().split(" ")
        return parts.every((part) => videoTitle.includes(part))
    }

    const getFilteredAndRankedSummaries = () => {
        if (!summaries) return []

        const isAutoSelectMode = getQueryParam("chatAutoSelect") === "true"

        if (currentFilter.length === 0 && isAutoSelectMode && videoMetadata) {
            return filterAndRankChatOptions(videoMetadata, summaries)
        } else {
            return summaries.filter(filterFunction)
        }
    }

    const getButtonText = function (summary) {
        const isAutoSelectMode = getQueryParam("chatAutoSelect") === "true"
        const hasMatchScore = typeof summary.matchScore === 'number'

        return <>
            <p className="chat-selection-button-title">{summary.title}</p>
            <p>{summary.created_at.slice(0, 10)}</p>
            <p>{summary.duration}</p>
            {isAutoSelectMode && hasMatchScore && (
                <p className="match-score">Match: {summary.matchScore}%</p>
            )}
        </>
    }

    const updateFilter = function (event) {
        setCurrentFilter(event.target.value)
    }

    const clearSearch = function (event) {
        if (event.target.value === SEARCH_PROMPT) {
            event.target.value = ""
        }
    }

    const uploadCustomFile = function (event) {
        const file = event.target.files[0]
        new Promise(((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
            reader.readAsText(file)
        }))
            .then((result) => onUploadCustomJson(JSON.parse(result)))
            .catch((error) => console.log(error))
    }

    const isAutoSelectMode = getQueryParam("chatAutoSelect") === "true"
    const filteredSummaries = getFilteredAndRankedSummaries()

    return (
        <>
            <form className="search-form">
                <button
                    className="seen-upload-chat-file-button"
                    onClick={(event) => {event.preventDefault(); document.getElementById("uploadChatFile").click()}}
                >
                    Upload chat file...
                </button>
                <input
                    type="file"
                    id="uploadChatFile"
                    className="hidden-upload-chat-file-button"
                    onChange={uploadCustomFile}
                />
                <p>---OR---</p>
                <input
                    defaultValue={SEARCH_PROMPT}
                    onClick={clearSearch}
                    onChange={updateFilter}
                    className="chat-search-box"
                />
                  )}
            </form>
            {summaries &&
                <div className="chat-selector">
                    {filteredSummaries.map((summary) =>
                        <button
                            key={summary.id}
                            className={`chat-selection-button ${summary.matchScore >= 80 ? 'high-match' : summary.matchScore >= 60 ? 'medium-match' : 'low-match'}`}
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

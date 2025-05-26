const MATCHING_CONFIG = {
    DURATION_TOLERANCE_PERCENT: 3,
    WEIGHTS: {
        DURATION: 0,
        TITLE: 100,
    }
}

const parseDurationToSeconds = (durationStr) => {
    if (!durationStr) return 0

    const hours = (durationStr.match(/(\d+)h/) || [0, 0])[1]
    const minutes = (durationStr.match(/(\d+)m/) || [0, 0])[1]
    const seconds = (durationStr.match(/(\d+)s/) || [0, 0])[1]

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
}

const formatSecondsToReadable = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    let result = ''
    if (hours > 0) result += `${hours}h`
    if (minutes > 0) result += `${minutes}m`
    if (secs > 0) result += `${secs}s`

    return result || '0s'
}

// Use Jaccard similarity, comparing unordered full word similarity beteen titles
// const calculateTitleSimilarity = (title1, title2) => {
//     if (!title1 || !title2) return 0

//     const normalize = (str) => str.toLowerCase()
//         .replace(/[^\w\s\d]/g, '')
//         .split(/\s+/)
//         .filter(word => word.length > 2)

//     const words1 = normalize(title1)
//     const words2 = normalize(title2)

//     if (words1.length === 0 || words2.length === 0) return 0

//     const set1 = new Set(words1)
//     const set2 = new Set(words2)

//     const intersection = new Set([...set1].filter(word => set2.has(word)))
//     const union = new Set([...set1, ...set2])

//     return Math.round((intersection.size / union.size) * 100)
// }

// extension of Jaccard similarity, to consider not only the unordered full word similarity,
// but also the frequency of word and increasing the weight of numbers in the title
const calculateTitleSimilarity = (title1, title2, numericWeight = 4) => {
    if (!title1 || !title2) return 0

    const normalize = (str) => str.toLowerCase()
        .replace(/[^\w\s\d]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0)

    const words1 = normalize(title1)
    const words2 = normalize(title2)

    if (words1.length === 0 || words2.length === 0) return 0

    // numbers are used for episode indicators and original vs sequel title naming, sometimes in
    // otherwise very similar titles. due to small variances in wording of titles, increasing the
    // weight of numbers matching helps to avoid selecting the wrong title
    const countFrequency = (words) => {
        const freq = new Map()
        words.forEach(word => {
            const weight = /^\d+$/.test(word) ? numericWeight : 1
            freq.set(word, (freq.get(word) || 0) + weight)
        })
        return freq
    }

    const freq1 = countFrequency(words1)
    const freq2 = countFrequency(words2)

    let intersectionSize = 0
    for (const [word, count1] of freq1.entries()) {
        const count2 = freq2.get(word) || 0
        intersectionSize += Math.min(count1, count2)
    }

    let unionSize = 0
    const allWords = new Set([...freq1.keys(), ...freq2.keys()])
    for (const word of allWords) {
        unionSize += Math.max(freq1.get(word) || 0, freq2.get(word) || 0)
    }

    return Math.round((intersectionSize / unionSize) * 100)
}

const isDurationMatch = (videoDurationSeconds, chatDurationSeconds) => {
    if (!videoDurationSeconds || !chatDurationSeconds) return false

    const tolerance = chatDurationSeconds * (MATCHING_CONFIG.DURATION_TOLERANCE_PERCENT / 100)
    const diff = Math.abs(videoDurationSeconds - chatDurationSeconds)

    return diff <= tolerance
}

const isDateMatch = (videoUploadDate, chatCreatedAt) => {
    if (!videoUploadDate || !chatCreatedAt) return false

    const videoDate = new Date(videoUploadDate)
    const chatDate = new Date(chatCreatedAt)
    const diffDays = Math.abs((videoDate - chatDate) / (1000 * 60 * 60 * 24))

    return diffDays <= MATCHING_CONFIG.DATE_TOLERANCE_DAYS
}

const calculateMatchScore = (videoMetadata, chatSummary) => {
    const { title: videoTitle, duration: videoDuration } = videoMetadata
    const { title: chatTitle, duration: chatDuration  } = chatSummary

    const videoDurationSeconds = videoDuration
    const chatDurationSeconds = parseDurationToSeconds(chatDuration)

    let durationScore = 0
    if (videoDurationSeconds && chatDurationSeconds) {
        const maxDuration = Math.max(videoDurationSeconds, chatDurationSeconds)
        const durationDiff = Math.abs(videoDurationSeconds - chatDurationSeconds)
        durationScore = Math.max(0, 100 - (durationDiff / maxDuration) * 100)
    }

    const titleScore = calculateTitleSimilarity(videoTitle, chatTitle)

    const compositeScore =
        (durationScore * MATCHING_CONFIG.WEIGHTS.DURATION / 100) +
        (titleScore * MATCHING_CONFIG.WEIGHTS.TITLE / 100)

    return Math.round(compositeScore)
}

export const filterAndRankChatOptions = (videoMetadata, chatSummaries) => {
    if (!videoMetadata || !chatSummaries) return []

    const { duration: videoDuration, uploadDate } = videoMetadata

    const candidates = chatSummaries.filter(summary => {
        const chatDurationSeconds = parseDurationToSeconds(summary.duration)

        return !(videoDuration && !isDurationMatch(videoDuration, chatDurationSeconds))
    })

    const rankedOptions = candidates.map(summary => ({
        ...summary,
        matchScore: calculateMatchScore(videoMetadata, summary)
    })).sort((a, b) => b.matchScore - a.matchScore)

    return rankedOptions
}

import { MatchingConfig, VideoMetadata, VodSummary } from '../types';

const MATCHING_CONFIG: MatchingConfig = {
    DURATION_TOLERANCE_PERCENT: 3,
    WEIGHTS: {
        DURATION: 0,
        TITLE: 100,
    }
}

const parseDurationToSeconds = (durationStr: string): number => {
    if (!durationStr) return 0

    const hours = (durationStr.match(/(\d+)h/) || ['0', '0'])[1]
    const minutes = (durationStr.match(/(\d+)m/) || ['0', '0'])[1]
    const seconds = (durationStr.match(/(\d+)s/) || ['0', '0'])[1]

    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds)
}

// extension of Jaccard similarity, to consider not only the unordered full word similarity,
// but also the frequency of word and increasing the weight of numbers in the title
const calculateTitleSimilarity = (title1: string, title2: string, numericWeight: number = 4): number => {
    if (!title1 || !title2) return 0

    const normalize = (str: string): string[] => str.toLowerCase()
        .replace(/[^\w\s\d]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0)

    const words1 = normalize(title1)
    const words2 = normalize(title2)

    if (words1.length === 0 || words2.length === 0) return 0

    // numbers are used for episode indicators and original vs sequel title naming, sometimes in
    // otherwise very similar titles. due to small variances in wording of titles, increasing the
    // weight of numbers matching helps to avoid selecting the wrong title
    const countFrequency = (words: string[]): Map<string, number> => {
        const freq = new Map<string, number>()
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

const isDurationMatch = (videoDurationSeconds: number, chatDurationSeconds: number): boolean => {
    if (!videoDurationSeconds || !chatDurationSeconds) return false

    const tolerance = chatDurationSeconds * (MATCHING_CONFIG.DURATION_TOLERANCE_PERCENT / 100)
    const diff = Math.abs(videoDurationSeconds - chatDurationSeconds)

    return diff <= tolerance
}

const calculateMatchScore = (videoMetadata: VideoMetadata, chatSummary: VodSummary): number => {
    const { title: videoTitle, duration: videoDuration } = videoMetadata
    const { title: chatTitle, duration: chatDuration } = chatSummary

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

export const filterAndRankChatOptions = (videoMetadata: VideoMetadata, chatSummaries: VodSummary[]): VodSummary[] => {
    if (!videoMetadata || !chatSummaries) return []

    const { duration: videoDuration } = videoMetadata

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

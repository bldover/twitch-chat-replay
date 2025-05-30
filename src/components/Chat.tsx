import './Chat.css'
import { FC, useEffect, useRef } from 'react'
import { colors } from '../utils/colors'
import { ChatMessage, BttvEmoteMap, VodSummary } from '../types'

type ChatProps = {
    chatMessages: ChatMessage[],
    bttvEmotes: BttvEmoteMap | null,
    selectedVod?: VodSummary | null,
    isVideoPlaying?: boolean
}

const Chat: FC<ChatProps> = ({ chatMessages, bttvEmotes, selectedVod, isVideoPlaying = false }) => {
    const predictionBlueUrl = 'https://static-cdn.jtvnw.net/badges/v1/e33d8b46-f63b-4e67-996d-4a7dcec0ad33/1'
    const predictionPinkUrl = 'https://static-cdn.jtvnw.net/badges/v1/4b76d5f2-91cc-4400-adf2-908a1e6cfd1e/1'
    const twitchStaffUrl = 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8f57-4e4bef88af34/1'
    const moderatorUrl = 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1'
    const subscriberUrl = 'https://static-cdn.jtvnw.net/badges/v1/5571b5a7-51ae-4ee4-a1b6-a25975c95dd7/1'

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }

    const formatTimestamp = (content_offset: number): string => {
        const hours = Math.floor(content_offset / 3600) === 0 ? '' : Math.floor(content_offset / 3600) + ':'
        const minutes = Math.floor((content_offset / 60) % 60).toString().padStart(hours ? 2 : 1, '0')
        const seconds = Math.floor(content_offset % 60).toString().padStart(2, '0')
        return `${hours}${minutes}:${seconds} `
    }

    const hashCode = (str: string): number => {
        var hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash;
    }

    const formatFragment = (fragment: any, i: number) => {
        if (fragment.emoticon) {
            const emoticonId = fragment.emoticon.emoticon_id
            return <img
                key={hashCode((i.toString() + fragment.text))}
                alt={fragment.text}
                className='emoticon'
                src={`https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/1.0`}
                srcSet={[
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/1.0 1x`,
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/2.0 2x`,
                    `https://static-cdn.jtvnw.net/emoticons/v1/${emoticonId}/3.0 4x`
                ].join(',')}
            />
        }
        const words = fragment.text.split(' ')

        // Gathered from https://github.com/night/betterttv/blob/ad5247ee36e82f1aadd539175f706785ee6a4e8e/src/modules/chat/index.js#L26-L31
        const modifiers: { [key: string]: string } = {
            'w!': ' modifier-wide',
            'v!': ' modifier-vertical',
            'h!': ' modifier-horizontal',
            'z!': ' modifier-zero-space'
        };

        return <span key={i + 'text'}>
            {words.map((word: string, j: number) => {
                const previousWord = words[j - 1] ?? null
                const nextWord = words[j + 1] ?? null

                // Don't display a modifier if it affects an emote
                if (modifiers[word] && bttvEmotes && nextWord && bttvEmotes[nextWord]) {
                    return <></>
                }

                if (bttvEmotes && bttvEmotes[word]) {
                    const className = 'emoticon' + (modifiers[previousWord] ?? '')

                    return <span key={`${i}-${j}-${word}-bttv`}>
                        <img
                            alt={word}
                            className={className}
                            src={`https://cdn.betterttv.net/emote/${bttvEmotes[word]}/1x`}
                            srcSet={[
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/1x 1x`,
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/2x 2x`,
                                `https://cdn.betterttv.net/emote/${bttvEmotes[word]}/3x 3x`
                            ].join(',')}
                        />
                        <span> </span>
                    </span>
                }
                return <span key={`${i}-${j}-${word}-normal`}>
                    {word + ' '}
                </span>
            })}
        </span>
    }

    const getColor = function (commenterName: string): string {
        let colorHash = Math.abs(hashCode(commenterName))
        return colors[colorHash % colors.length]
    }

    const hasBadge = function (message: ChatMessage, badgeId: string, badgeVersion?: string): boolean {
        const badges = message.message.user_badges
        return !!(badges && badges.some((badge) =>
            badge._id === badgeId && (!badgeVersion || badge.version === badgeVersion)
        ))
    }

    const formatMessage = (message: ChatMessage) => {
        // There are null commenter names in 873550274.json - twitch was having issues at the time
        const commenterName = message.commenter?.display_name || 'UNKNOWN'
        // There are messages without fragments in 1075023215.json - no idea why. Emotes won't work properly for those messages.
        const fragments = message.message?.fragments || [{ text: message.message.body }]
        return <>
            <span>{formatTimestamp(message.content_offset_seconds)}</span>
            {hasBadge(message, 'predictions', 'blue-1') && <><img alt='prediction-blue-1' src={predictionBlueUrl} className='badge' /><span> </span></>}
            {hasBadge(message, 'predictions', 'pink-2') && <><img alt='prediction-pink-2' src={predictionPinkUrl} className='badge' /><span> </span></>}
            {hasBadge(message, 'staff') && <><img alt='twitch-staff' src={twitchStaffUrl} className='badge' /><span> </span></>}
            {hasBadge(message, 'moderator') && <><img alt='moderator' src={moderatorUrl} className='badge' /><span> </span></>}
            {hasBadge(message, 'subscriber') && <><img alt='subscriber' src={subscriberUrl} className='badge' /><span> </span></>}
            <span className='commenter' style={{ color: getColor(commenterName) }}>{commenterName + ': '}</span>
            {fragments.map(formatFragment)}
        </>
    }

    useEffect(scrollToBottom, [chatMessages])

    const shouldShowWaitingMessage = selectedVod && !isVideoPlaying && chatMessages.length === 0

    return <>
        <div className='messages-container'>
            {shouldShowWaitingMessage ? (
                <div className='chat-waiting-message'>
                    <div className='vod-title'>{selectedVod.title}</div>
                    <div className='waiting-instruction'>Play a video to start the chat replay</div>
                </div>
            ) : (
                chatMessages.map(message => (
                    <p key={message._id} className='chatMessage'>{formatMessage(message)}</p>
                ))
            )}
            <div key={'messagesEnd'} ref={messagesEndRef} />
        </div>
    </>
}

export default Chat

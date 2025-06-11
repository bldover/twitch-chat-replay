import './Chat.css'
import { FC, useEffect, useRef } from 'react'
import { ChatMessage as ChatMessageType, BttvEmoteMap, VodSummary, BadgeMap } from '../../types'
import ChatMessage from './ChatMessage'

type ChatProps = {
    chatMessages: ChatMessageType[],
    bttvEmotes: BttvEmoteMap | null,
    badgeMap: BadgeMap | null,
    selectedVod?: VodSummary | null,
    isVideoPlaying?: boolean
}

const Chat: FC<ChatProps> = ({ chatMessages, bttvEmotes, badgeMap, selectedVod, isVideoPlaying = false }) => {

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
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
                    <ChatMessage key={message._id} message={message} bttvEmotes={bttvEmotes} badgeMap={badgeMap} />
                ))
            )}
            <div key={'messagesEnd'} ref={messagesEndRef} />
        </div>
    </>
}

export default Chat

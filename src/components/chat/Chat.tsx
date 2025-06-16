import './Chat.css'
import { FC, useEffect, useRef } from 'react'
import { ChatMessage as ChatMessageType, BttvEmoteMap, BadgeMap } from '../../types'
import ChatMessage from './ChatMessage'

type ChatProps = {
    chatMessages: ChatMessageType[],
    bttvEmotes: BttvEmoteMap | null,
    badgeMap: BadgeMap | null
}

const Chat: FC<ChatProps> = ({ chatMessages, bttvEmotes, badgeMap }) => {

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }

    useEffect(scrollToBottom, [chatMessages])

    return <>
        <div className='messages-container'>
            {chatMessages.map(message => (
                <ChatMessage key={message._id} message={message} bttvEmotes={bttvEmotes} badgeMap={badgeMap} />
            ))}
            <div key={'messagesEnd'} ref={messagesEndRef} />
        </div>
    </>
}

export default Chat

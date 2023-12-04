'use client'

import { cn } from '@/lib/utils'
import { Message } from '@/lib/validations/message'
import { FC, useRef, useState } from 'react'

interface MessagesProps {
    initialMessages: Message[]
    userId: string
}



const Messages: FC<MessagesProps> = ({ initialMessages, userId }) => {

    const [messages, setMessages] = useState<Message[]>(initialMessages)

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    return (
        <div id='messges' className='fles h-full flex-1 flex-col-reverse gap-4 p-3 overflow-auto scrollbar-thumb-rounded scrollbar-track-blue scrollbar-w-2 scrolling-touch'>
            <div ref={scrollDownRef} />

            {messages.map((message, index) => {
                const isCurrentUser = message.senderId === userId;
                const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId

                return (
                    <div className='chat-message' key={`${message.id}-${message.timestamp}`}>
                        <div className={cn('flex items-end', {
                            'justify-end': isCurrentUser
                        })}>
                            <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                                'order-1 items-end': isCurrentUser,
                                'order-2 items-start': !isCurrentUser
                            })}>
                                <span className={cn('px-4 py-2 rounded-lg inline-block', {
                                    'bg-indigo-600 text-white': isCurrentUser,
                                    'bg-gray-200 text-gray-900': !isCurrentUser,
                                    'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                                    'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser
                                })}>
                                    {message.text}{' '}
                                    <span className='ml-2 text-xs text-gray-400'>
                                        {message.timestamp}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Messages
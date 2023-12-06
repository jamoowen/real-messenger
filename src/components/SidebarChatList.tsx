'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'

import { usePathname, useRouter } from 'next/navigation'
import { FC, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
    friends: User[]
    userId: string
}

interface ExtendedMessage extends Message {
    senderImage: string
    senderName: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, userId }) => {

    const router = useRouter();
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${userId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${userId}:friends`))

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(userId, message.senderId)}`

            if (!shouldNotify) {
                return 
            }
            
            // Notify
            toast.custom((t) => (
                <UnseenChatToast
        
                t={t} 
                userId={userId} 
                senderId={message.senderId} 
                senderImage={message.senderImage} 
                senderName={message.senderName} 
                senderMessage={message.text}
                />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        const friendHandler = (newFriend: User) => {
            setActiveChats((prev) => [...prev, newFriend])
        }

        pusherClient.bind('new-message', chatHandler)
        pusherClient.bind('new-friend', friendHandler)

        return () => {
            pusherClient.subscribe(toPusherKey(`user:${userId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`))

            pusherClient.unbind('new-message', chatHandler)
            pusherClient.unbind('new-friend', friendHandler)
        }
    }, [pathname, userId, router])

    useEffect(() => {
        if (pathname.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }

    }, [pathname])



    return (
        <>
            <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
                {friends.sort().map((friend) => {
                    const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                        return unseenMsg.senderId === friend.id
                    }).length
                    return <li key={friend.id}>
                        <a
                            href={`/dashboard/chat/${chatHrefConstructor(
                                userId,
                                friend.id
                            )}`}
                            className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-small leading-6 font-semibold'
                        >
                            {friend.name}
                            {unseenMessagesCount > 0 ? (
                                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center' >
                                    {unseenMessagesCount}
                                </div>
                            ) : (null)}
                        </a>
                    </li>
                })}
            </ul>
        </>
    )
}

export default SidebarChatList
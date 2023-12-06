'use client'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import axios from 'axios'
import { request } from 'http'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface FriendrequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const Friendrequests: FC<FriendrequestsProps> = ({ incomingFriendRequests, sessionId }) => {

    const router = useRouter();
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))

        const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
            setFriendRequests((prev) => [...prev,{senderId, senderEmail}])
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`))
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])


    const acceptFriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', { id: senderId })
        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
        router.refresh()
    }
    const rejectFriend = async (senderId: string) => {
        await axios.post('/api/friends/reject', { id: senderId })
        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
        router.refresh()
    }

    return (
        <>
            {friendRequests.length === 0 ? (
                <p className='text-small text-zinc-500'>No new Friend Requests</p>
            ) : (friendRequests.map((request) => (
                <div key={request.senderId} className='flex gap-4 items-center'>
                    <UserPlus className='text-black' />
                    <p className='font-md text-lg'>{request.senderEmail}</p>
                    <button
                        onClick={() => acceptFriend(request.senderId)}
                        aria-label='Accept Friend'
                        className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md' >
                        <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                    <button
                        onClick={() => rejectFriend(request.senderId)}
                        aria-label='Reject Friend'
                        className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md' >
                        <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>

                </div>
            )))}
        </>
    )
}

export default Friendrequests
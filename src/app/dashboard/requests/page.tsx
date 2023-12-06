import Friendrequests from '@/components/Friendrequests';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation';
import { FC } from 'react'


const page = async () => {

    const session = await getServerSession(authOptions);

    if (!session) notFound()

    const incomingRequests = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`)) as string[]

    const incomingEmails = await Promise.all(
        incomingRequests.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as string
            const senderParsed = JSON.parse(sender)
            return {
                senderId,
                senderEmail: senderParsed.email
            }
        })
    )
    return (
        <main className='pt-8 px-2'>
            <h1 className='font-bold text-5xl mb-8'>Friend Requests</h1>
            <div className='flex flex-col gap-4'>
                <Friendrequests incomingFriendRequests={incomingEmails} sessionId={session.user.id} />
            </div>

        </main>
    )
}

export default page
import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { getSession } from "next-auth/react"
import { z } from "zod"

export async function POST(req: Request) {
    

    try {
        const body = await req.json()
        const {id: idToAdd} = z.object({id: z.string()}).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', {status: 401})
        }
        const alreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)
        if (alreadyFriends) {
            return new Response('Already a friend', {status: 400})
        }

        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)
        

        if (!hasFriendRequest) {
            return new Response("No friend request", {status: 400})
        }

        // trigger for notifying user
        pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new-friend', {})

        // add the friend to the users friend list as well as the friend list of the requester
        await db.sadd(`user:${session.user.id}:friends`, idToAdd)   
        await db.sadd(`user:${idToAdd}:friends`, session.user.id)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)



        return new Response('ok')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", {status: 422})
        }
        return new Response('Error adding friend', {status: 400})
        
        
    }
}
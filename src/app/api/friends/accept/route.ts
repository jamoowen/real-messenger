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
        const { id: idToAdd } = z.object({ id: z.string() }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }
        const alreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)
        if (alreadyFriends) {
            return new Response('Already a friend', { status: 400 })
        }

        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)


        if (!hasFriendRequest) {
            return new Response("No friend request", { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis(`get`, `user:${session.user.id}`),
            fetchRedis(`get`, `user:${idToAdd}`)
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        // trigger for notifying user

        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new-friend', user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`), 'new-friend', friend),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),   
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)
        ])

        return new Response('ok')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", { status: 422 })
        }
        return new Response('Error adding friend', { status: 400 })


    }
}
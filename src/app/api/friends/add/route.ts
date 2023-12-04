import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {

        const body = await req.json()

        const { email: emailToAdd } = addFriendValidator.parse(body.email)
        
        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string

        const session = await getServerSession(authOptions);

        // console.log(`idToAdd: ${idToAdd}, user: ${session?.user.id}, email: ${emailToAdd}`)
        // check user exists
        if (!idToAdd) {
            return new Response('User does not exist', { status: 400 })
        }

        // check signed in
        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }
        

        // check not adding yourself
        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend', { status: 400 })
        }

        // check if user already added
        const isAlreadyAdded = (await fetchRedis('sismember', `user:${idToAdd}:incoming_friend_request`, session.user.id)) as 0 | 1

        if (isAlreadyAdded) {
            return new Response('already added user', { status: 400 })
        } 
        const isAlreadyFriend = (await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1

        if (isAlreadyFriend) {
            return new Response('User already a friend', { status: 400 })
        }

        // send request
        // sadd = set add
        db.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id);

        return new Response('Friend request submitted', { status: 200 })




    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 })
        }
        return new Response("Invalid request", { status: 400 })

    }
}
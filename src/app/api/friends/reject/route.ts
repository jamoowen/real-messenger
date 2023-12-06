import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req:Request) {
    try {
        const body = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", {status: 401})

        }

        const {id: idToReject} = z.object({id: z.string()}).parse(body)

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToReject)

        return new Response('ok')

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid Request Payload', {status: 422})
        }
        return new Response("Invalid Reject Request", {status:400})
    }
}
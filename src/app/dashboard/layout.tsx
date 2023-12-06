import FriendRequestsSidebar from "@/components/FriendRequestsSidebar";
import { Icon, Icons } from "@/components/Icons";
import MobileChatLayout from "@/components/MobileChatLayout";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { SidebarOption } from "@/types/typings";
import { Sidebar } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
    children: ReactNode
}



const sidebarOptions: SidebarOption[] = [
    {
        id: 1,
        name: 'Add Friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]

const Layout = async ({ children }: LayoutProps) => {

    const session = await getServerSession(authOptions)
    if (!session) notFound();

    const friends = await getFriendsByUserId(session.user.id)

    const unseenRequestCount = (await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as User[]).length
    // console.log(`user: ${session.user.id}, unseen: ${unseenRequestCount}`)

    return (
        <div className="w-full flex h-screen">
            <div className='sm:hidden'>
                <MobileChatLayout friends={friends} session={session} sidebarOptions={sidebarOptions} unseenRequestCount={unseenRequestCount}/>
            </div>
            <div className='flex md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
                <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                    <Icons.Logo className='h-8 w-auto text-indigo-600' />
                </Link>

                <div className="text-xs font-semibold leading-6 text-gray-400">
                    Chats
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">


                        <li>
                            <SidebarChatList friends={friends} userId={session.user.id} />
                        </li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                                overview
                            </div>
                            <ul role="list" className=" mt-2 space-y-1">
                                {sidebarOptions.map((option) => {
                                    const Icon = Icons[option.Icon]
                                    return (
                                        <li key={option.id}>
                                            <Link href={option.href} className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md padding-2 text-small leading-6 font-semibold">
                                                <span className="text-gray-400 border-gray-400 flex group-hover:border-indigo-600 group-hover:text-indigo-600 h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="truncate">{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                                <li>
                                    <FriendRequestsSidebar sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                                </li>
                            </ul>
                        </li>



                        <li className="-mx-6 mt-auto flex items-center">
                            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-600">
                                <div className="relative h-8 w-8 bg-gray-50">
                                    <Image
                                        fill
                                        referrerPolicy="no-referrer"
                                        className="rounded-full"
                                        src={session.user.image || ''}
                                        alt="Profile Picture"
                                    />
                                </div>
                                <span className="sr-only">Your Profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden='true' >{session.user.name}</span>
                                    <span className="text-xs text-zinc-400" aria-hidden='true'>{session.user.email}</span>
                                </div>

                            </div>


                        </li>
                        <SignOutButton className="h-8 w-full  justify-start -mx-3 mb-2  aspect-square" />
                    </ul>

                </nav>

            </div>
            <aside className="max-h-screen container py-16 md:py-12">{children}</aside>

        </div>
    )
}

export default Layout
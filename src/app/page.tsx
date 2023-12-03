import Button from '@/components/ui/Button'
import { db } from '@/lib/db'
import Image from 'next/image'
import { FC } from 'react'

export default async function Home() {


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
       <Button> Buttone</Button>
      </div>
    </main>
  )
}

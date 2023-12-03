'use client'


import { FC, useState } from 'react'
import Button from './ui/Button'
import { addFriendValidator } from '@/lib/validations/add-friend'
import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'


interface AddFriendButtonProps {
  
}

// creates a type from the zod validation function we created
type FormData = z.infer<typeof addFriendValidator>

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {

    const [showSuccess, setShowSuccess] = useState<boolean>(false)

    // this can be passed to the form - means that user input (email) will be 
    // validated when the user enters it and errors handled by react hook form
    const { register, handleSubmit, setError, formState: {errors} } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator)
    })

    const onSubmit = (data: FormData) => {
        addFriend(data.email)
    }

    const addFriend =async (email:string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email });

            await axios.post('/api/friends/add', {
                email: validatedEmail,
            })
            setShowSuccess(true);

        } catch (error) {
            if (error instanceof z.ZodError) {
                setError('email', {message: error.message})
                return 
            }
            if (error instanceof AxiosError) {
                setError('email', {message: error.response?.data})
                return 
            }

            setError('email', {message: 'something went wrong'})
            
        }
    }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
        <label htmlFor="email" className='block text-sm font-medium leading-6 text-gray-900'>
            Add friend by E-Mail
        </label>
        <div className='mt-2 flex gap-4'>
            <input 
            {...register('email')}
            type="text" 
            className='px-2 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-700 sm:text-sm leading-6' 
            placeholder='johnsmith@example.com'
            />
            <Button >Add</Button>
        </div>
        <p className='mt-1 text-sm text-red-600'> {errors.email?.message} </p>
        {showSuccess ? 
         <p className='mt-1 text-sm text-green-500'> Success </p>
        : ''}
    </form>
  )
}

export default AddFriendButton
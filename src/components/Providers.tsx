'use client'

import { Children, FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";


interface ProviderProps { 
    children: ReactNode
 }

const Providers: FC<ProviderProps> = ({ children }) => {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
                {children}
           
        </>
    )
}
export default Providers
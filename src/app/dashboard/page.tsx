import { FC } from "react";
import Button from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


interface pageProps {}

const Dashboard:FC<pageProps> = async ({}) => {
    
    const session = await getServerSession(authOptions);
    
    return (
        <div>
            <pre>Dashboard</pre>
        </div>
    )
}
export default Dashboard
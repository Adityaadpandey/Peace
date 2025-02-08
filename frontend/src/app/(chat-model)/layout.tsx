import React from 'react'

type Props = {
    children: React.ReactNode
}

const ChatLayout = ({ children }: Props) => {
    return (
        <div className='flex flex-col h-screen'>
            {children}
        </div>
    )
}

export default ChatLayout

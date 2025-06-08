import { FC, useState, useEffect } from 'react'
import './AnimatedPlaceholder.css'

type AnimatedPlaceholderProps = {
    placeholders: string[]
    show: boolean
}

export const AnimatedPlaceholder: FC<AnimatedPlaceholderProps> = ({ placeholders, show }) => {
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
    const [placeholderOpacity, setPlaceholderOpacity] = useState(1)

    useEffect(() => {
        if (!show) return

        const interval = setInterval(() => {
            setPlaceholderOpacity(0)
            setTimeout(() => {
                setCurrentPlaceholder(prev => (prev + 1) % placeholders.length)
                setPlaceholderOpacity(1)
            }, 300)
        }, 3000)

        return () => clearInterval(interval)
    }, [show, placeholders.length])

    if (!show) return null

    return (
        <div
            className='animated-placeholder'
            style={{ opacity: placeholderOpacity }}
        >
            {placeholders[currentPlaceholder]}
        </div>
    )
}
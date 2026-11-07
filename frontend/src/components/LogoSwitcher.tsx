import { useEffect, useState } from "react"

const LOGOS = [
    { src: '/public/icons/top.png', url: "https://top-academy.ru"},
    { src: '/public/icons/top-college.png', url: "https://top-academy.ru"},
    { src: '/public/icons/tech-university.png', url: "https://top-academy.ru"}
]
export const LogoSwitcher = () => {
    const [activeIndex, setActiveIndex] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % LOGOS.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])
    return (
        <div className="logo-switcher">
            {LOGOS.map((logo, index) => (
                <a 
                    key={logo.src}
                    href={logo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`switcher-logo ${index === activeIndex ? 'active' : ''}`}
                    style={{ pointerEvents: index === activeIndex ? 'auto' : 'none'}}
                    >
                        <img 
                            src={logo.src} 
                            alt="Логотип партнера" 
                            style={{width: '100%', height: '100%', objectFit: "contain"}}/>
                    </a>
            ))}
        </div>
    )
}

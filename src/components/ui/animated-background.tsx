'use client'

import { useEffect, useState } from 'react'
import { Sparkles, FileText, Briefcase } from 'lucide-react'

export default function AnimatedBackground() {
    // Generate static items on client to avoid hydration mismatch
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Generate floating icons and stars
    const elements = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 20 + 20}s`, // Slower float
        animationDelay: `-${Math.random() * 20}s`,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.1,
        type: i % 15 === 0 ? 'icon' : 'star'
    }))

    // Generate shooting stars
    const shootingStars = Array.from({ length: 12 }).map((_, i) => ({
        id: `meteor-${i}`,
        top: `${Math.random() * -50}%`,
        left: `${Math.random() * 150}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${Math.random() * 3 + 2}s`
    }))

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
            {/* Base Background Noise & Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)]"></div>

            {/* Ambient Deep Glows */}
            <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]"></div>

            {/* Floating Particles and Icons */}
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute bottom-[-10%] flex animate-float items-center justify-center text-violet-300 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    style={{
                        left: el.left,
                        animationDuration: el.animationDuration,
                        animationDelay: el.animationDelay,
                        width: el.type === 'star' ? `${el.size}px` : 'auto',
                        height: el.type === 'star' ? `${el.size}px` : 'auto',
                        opacity: el.opacity,
                    }}
                >
                    {el.type === 'star' ? (
                        <div className="h-full w-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    ) : el.id % 3 === 0 ? (
                        <Sparkles size={16} />
                    ) : el.id % 3 === 1 ? (
                        <FileText size={16} />
                    ) : (
                        <Briefcase size={16} />
                    )}
                </div>
            ))}

            {/* Shooting Stars (Meteors) */}
            {shootingStars.map((meteor) => (
                <div
                    key={meteor.id}
                    className="absolute top-1/2 left-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]"
                    style={{
                        top: meteor.top,
                        left: meteor.left,
                        animationDelay: meteor.animationDelay,
                        animationDuration: meteor.animationDuration,
                    }}
                >
                    <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-slate-400 to-transparent mix-blend-screen" />
                </div>
            ))}
        </div>
    )
}

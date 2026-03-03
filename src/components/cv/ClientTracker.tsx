'use client'

import { useEffect, useRef } from 'react'

export default function ClientTracker({ slug }: { slug: string }) {
    const trackedRef = useRef(false)

    useEffect(() => {
        if (trackedRef.current) return

        async function trackView() {
            try {
                await fetch('/api/links/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug }),
                })
            } catch (error) {
                console.error('Tracking error:', error)
            }
        }

        trackView()
        trackedRef.current = true
    }, [slug])

    return null
}

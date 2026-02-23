'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function PortalButton() {
    const [loading, setLoading] = useState(false)

    async function handlePortal() {
        try {
            setLoading(true)
            const res = await fetch('/api/stripe/portal', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error('Hata oluştu', { description: data.error })
                setLoading(false)
                return
            }

            // Kullanıcıyı Stripe Müşteri Portalı'na yönlendir
            if (data.url) {
                window.location.href = data.url
            }
        } catch (e) {
            setLoading(false)
            toast.error('Bağlantı hatası')
            console.error(e)
        }
    }

    return (
        <Button
            onClick={handlePortal}
            disabled={loading}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Settings className="mr-2 h-4 w-4" />
            )}
            Aboneliği Yönet (Stripe Portal)
        </Button>
    )
}

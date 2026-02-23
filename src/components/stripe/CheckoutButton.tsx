'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CheckoutButton() {
    const [loading, setLoading] = useState(false)

    async function handleCheckout() {
        try {
            setLoading(true)
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error('Hata oluştu', { description: data.error })
                setLoading(false)
                return
            }

            // Kullanıcıyı Stripe'a yönlendir
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
            onClick={handleCheckout}
            disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
        >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Şimdi Abone Ol ($99/yıl)
        </Button>
    )
}

'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function PrintButton() {
    return (
        <Button
            className="h-8 gap-2 bg-white/10 text-white hover:bg-white/20 text-xs"
            onClick={() => {
                if (typeof window !== 'undefined') {
                    window.print()
                }
            }}
        >
            <Download className="h-3.5 w-3.5" />
            <span>İndir / PDF</span>
        </Button>
    )
}

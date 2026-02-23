'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Sparkles } from 'lucide-react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">
                            CV<span className="text-violet-400">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-8 md:flex">
                        <Link
                            href="/#features"
                            className="text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            Özellikler
                        </Link>
                        <Link
                            href="/#pricing"
                            className="text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            Fiyatlar
                        </Link>
                        <Link
                            href="/#faq"
                            className="text-sm text-zinc-400 transition-colors hover:text-white"
                        >
                            SSS
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden items-center gap-3 md:flex">
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                            >
                                Giriş Yap
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500">
                                Ücretsiz Dene
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-zinc-400 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="border-t border-white/10 bg-black/90 py-4 md:hidden">
                    <div className="mx-auto max-w-7xl space-y-3 px-4">
                        <Link
                            href="/#features"
                            className="block text-zinc-400 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            Özellikler
                        </Link>
                        <Link
                            href="/#pricing"
                            className="block text-zinc-400 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            Fiyatlar
                        </Link>
                        <Link
                            href="/#faq"
                            className="block text-zinc-400 hover:text-white"
                            onClick={() => setIsOpen(false)}
                        >
                            SSS
                        </Link>
                        <div className="flex flex-col gap-2 pt-4">
                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">
                                    Giriş Yap
                                </Button>
                            </Link>
                            <Link href="/signup" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                                    Ücretsiz Dene
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

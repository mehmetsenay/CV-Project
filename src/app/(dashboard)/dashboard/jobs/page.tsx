'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Search, MapPin, Briefcase, ExternalLink, Loader2, Target,
    SlidersHorizontal, Clock, Users, ChevronDown, ChevronUp, X, Wifi
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────
interface JobData {
    title: string
    companyName: string
    location?: string
    link?: string
    description?: string
    postDate?: string
    isRemote?: boolean
    employmentType?: string
    experienceLevel?: string
    applicantCount?: number | null
}

// ── Filter Constants ────────────────────────────────────────────────────────
const DATE_OPTIONS = [
    { label: 'Son 24 Saat', value: 'r86400' },
    { label: 'Son 3 Gün', value: 'r259200' },
    { label: 'Son Hafta', value: 'r604800' },
    { label: 'Son Ay', value: 'r2592000' },
]

const JOB_TYPE_OPTIONS = [
    { label: 'Tümü', value: '' },
    { label: 'Tam Zamanlı', value: 'F' },
    { label: 'Yarı Zamanlı', value: 'P' },
    { label: 'Sözleşmeli', value: 'C' },
    { label: 'Geçici', value: 'T' },
    { label: 'Staj', value: 'I' },
]

const EXPERIENCE_OPTIONS = [
    { label: 'Tümü', value: '' },
    { label: 'Stajyer', value: '1' },
    { label: 'Giriş Seviyesi', value: '2' },
    { label: 'Orta Seviye', value: '3' },
    { label: 'Kıdemli', value: '4' },
    { label: 'Direktör', value: '5' },
    { label: 'Yönetici', value: '6' },
]

// ── Location Suggestions ───────────────────────────────────────────────────
const LOCATION_LIST = [
    // Türkiye
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Mersin', 'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun',
    'Denizli', 'Şanlıurfa', 'Malatya', 'Trabzon', 'Erzurum', 'Van', 'Kocaeli',
    'Manisa', 'Kahramanmaraş', 'Hatay', 'Balıkesir', 'Sakarya', 'Tekirdağ',
    'Muğla', 'Aydın', 'Edirne', 'Çanakkale', 'Zonguldak', 'Rize',
    // Global
    'Remote', 'United States', 'United Kingdom', 'Germany', 'Netherlands',
    'Canada', 'Australia', 'France', 'Switzerland', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Austria', 'Belgium', 'Spain', 'Italy', 'Portugal',
    'Poland', 'Czech Republic', 'Romania', 'Hungary', 'Dubai', 'Singapore',
    'India', 'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina',
    'New York', 'San Francisco', 'London', 'Berlin', 'Amsterdam', 'Paris',
    'Zurich', 'Stockholm', 'Oslo', 'Copenhagen', 'Vienna', 'Barcelona',
    'Milan', 'Warsaw', 'Prague', 'Bucharest', 'Budapest', 'Dublin', 'Toronto',
    'Vancouver', 'Sydney', 'Melbourne', 'Tokyo', 'Seoul', 'Mumbai', 'Bangalore',
]

// ── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-black/40 border border-white/5 p-6 rounded-2xl animate-pulse flex flex-col gap-3">
            <div className="h-5 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3.5 bg-white/5 rounded-lg w-1/2" />
            <div className="h-3 bg-white/5 rounded-lg w-1/3" />
            <div className="mt-3 h-3 bg-white/5 rounded-lg w-full" />
            <div className="h-3 bg-white/5 rounded-lg w-5/6" />
            <div className="mt-4 flex flex-col gap-2">
                <div className="h-9 bg-white/5 rounded-xl" />
                <div className="h-9 bg-white/5 rounded-xl" />
            </div>
        </div>
    )
}

// ── Filter Pill ───────────────────────────────────────────────────────────
function FilterPill({
    label, selected, onClick
}: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                ${selected
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                }
            `}
        >
            {label}
        </button>
    )
}

// ── Job Card ──────────────────────────────────────────────────────────────
function JobCard({ job, onCreateCV }: { job: JobData; onCreateCV: () => void }) {
    const isNew = job.postDate?.toLowerCase().includes('hour') ||
        job.postDate?.toLowerCase().includes('saat') ||
        job.postDate?.toLowerCase().includes('minute') ||
        job.postDate?.toLowerCase().includes('dakika') ||
        job.postDate === '1 day ago' ||
        job.postDate?.toLowerCase().includes('gün önce') === false

    return (
        <div className="group relative bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-violet-500/40 transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] flex flex-col justify-between hover:-translate-y-1 duration-200">
            {/* Top badges */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1.5">
                    {job.isRemote && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <Wifi className="h-2.5 w-2.5" /> Remote
                        </span>
                    )}
                    {job.postDate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/5 text-zinc-500 border border-white/5">
                            <Clock className="h-2.5 w-2.5" /> {job.postDate}
                        </span>
                    )}
                </div>
                {job.applicantCount != null && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                        <Users className="h-2.5 w-2.5" /> {job.applicantCount}
                    </span>
                )}
            </div>

            {/* Title & company */}
            <div>
                <h3 className="font-bold text-base text-white mb-1 line-clamp-2 leading-snug">
                    {job.title}
                </h3>
                <p className="text-violet-400 font-medium text-sm flex items-center gap-1.5 mb-2">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">{job.companyName}</span>
                </p>
                {job.location && (
                    <p className="text-zinc-500 text-xs flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" /> {job.location}
                    </p>
                )}

                {/* Description preview */}
                {job.description && (
                    <p className="mt-3 text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                        {job.description.slice(0, 200)}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
                <Link href={job.link || '#'} target="_blank" rel="noopener noreferrer">
                    <Button
                        variant="outline"
                        className="w-full bg-transparent border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-colors text-sm h-9"
                    >
                        LinkedIn'de Gör <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </Button>
                </Link>
                <Button
                    onClick={onCreateCV}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] text-sm h-9"
                >
                    <Target className="mr-2 h-3.5 w-3.5" /> Bu İlan İçin CV Oluştur
                </Button>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function JobsPage() {
    const router = useRouter()

    // Form state
    const [keyword, setKeyword] = useState('')
    const [location, setLocation] = useState('')
    const [datePosted, setDatePosted] = useState('')
    const [jobType, setJobType] = useState('')
    const [experienceLevel, setExperienceLevel] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Location autocomplete
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const locationWrapperRef = useRef<HTMLDivElement>(null)

    // Result state
    const [status, setStatus] = useState<'idle' | 'searching' | 'done' | 'error'>('idle')
    const [jobs, setJobs] = useState<JobData[]>([])

    const pollingRef = useRef<{ runId: string; interval: NodeJS.Timeout | null } | null>(null)

    // Tüm Türkçe karakterleri katı bir şekilde İngilizce karşılığına çevirir
    const normalizeString = (str: string) => {
        return str
            .toLowerCase()
            .replace(/i̇/g, 'i') // Bazen toLowerCase 'İ' harfini 'i' ve birleştirici nokta olarak çevirir
            .replace(/i/g, 'i')
            .replace(/ı/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ğ/g, 'g')
            .trim()
    }

    // Filter location suggestions as user types
    const handleLocationChange = useCallback((val: string) => {
        setLocation(val)
        if (val.trim().length >= 1) {
            const q = normalizeString(val)

            // Başından eşleşenler önce, sonra içerenler
            const startsWith = LOCATION_LIST.filter(l => normalizeString(l).startsWith(q))
            const contains = LOCATION_LIST.filter(l => !normalizeString(l).startsWith(q) && normalizeString(l).includes(q))

            // Eşleşenleri birleştir ve tekilleştir (aynı eleman iki kez gelmesin diye, gerçi mantıken gelmez)
            const filtered = Array.from(new Set([...startsWith, ...contains])).slice(0, 8)

            setLocationSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        } else {
            setLocationSuggestions([])
            setShowSuggestions(false)
        }
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (locationWrapperRef.current && !locationWrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const hasActiveFilters = datePosted || jobType || experienceLevel

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (!keyword.trim()) return

        setShowFilters(false) // Aramaya basında filtre panelini otomatik kapat
        setStatus('searching')
        setJobs([])

        try {
            const res = await fetch('/api/scrape/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    location: location.trim(),
                    datePosted,
                    jobType,
                    experienceLevel,
                    type: 'jobs',
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error('Arama başlatılamadı', { description: data.error })
                setStatus('error')
                return
            }

            pollingRef.current = { runId: data.runId, interval: null }
            const interval = setInterval(() => pollStatus(), 5000)
            pollingRef.current.interval = interval

            // 3 dakika timeout
            setTimeout(() => {
                if (pollingRef.current?.interval) {
                    clearInterval(pollingRef.current.interval)
                    pollingRef.current = null
                    setStatus('error')
                    toast.error('Arama zaman aşımına uğradı', {
                        description: 'LinkedIn çok yavaş yanıt verdi. Lütfen tekrar deneyin.',
                    })
                }
            }, 3 * 60 * 1000)
        } catch {
            toast.error('Bağlantı hatası')
            setStatus('error')
        }
    }

    async function pollStatus() {
        if (!pollingRef.current) return
        const { runId } = pollingRef.current

        try {
            const res = await fetch(`/api/scrape/search/status/${runId}`)
            const data = await res.json()

            if (data.status === 'SUCCEEDED') {
                if (pollingRef.current?.interval) clearInterval(pollingRef.current.interval)
                pollingRef.current = null
                setJobs(data.data || [])
                setStatus('done')
                toast.success(`${data.data?.length || 0} iş ilanı bulundu!`)
            } else if (data.status === 'FAILED') {
                if (pollingRef.current?.interval) clearInterval(pollingRef.current.interval)
                pollingRef.current = null
                setStatus('error')
                toast.error('Arama başarısız oldu')
            }
        } catch (err) {
            console.error('Polling hatası:', err)
        }
    }

    useEffect(() => {
        return () => {
            if (pollingRef.current?.interval) clearInterval(pollingRef.current.interval)
        }
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Header */}
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3 flex items-center gap-3">
                    İş İlanları Ara
                </h1>
                <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                    LinkedIn üzerinden en güncel ilanları saniyeler içinde tara, filtrele ve sana en uygun pozisyonlar için yapay zeka destekli özel CV'ni hemen oluştur.
                </p>
            </div>

            {/* Search Form */}
            <div className="relative z-20 group">
                {/* Animated Glowing Gradient Border Effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-violet-600/40 via-fuchsia-500/40 to-indigo-600/40 rounded-3xl opacity-50 group-hover:opacity-100 blur-sm transition-all duration-500" />

                <div className="p-6 bg-[#0a0a0c]/90 border border-white/5 rounded-3xl backdrop-blur-xl relative overflow-visible shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                    <form onSubmit={handleSearch} className="relative z-10 space-y-5">
                        {/* Main search row */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Keyword */}
                            <div className="relative flex-1 group/input">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors group-focus-within/input:text-violet-400" />
                                <Input
                                    placeholder="Pozisyon, beceri veya şirket arayın..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="bg-zinc-900/50 border-white/5 pl-11 h-12 text-white text-[15px] rounded-2xl focus:border-violet-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-violet-500/10 placeholder:text-zinc-600 transition-all shadow-inner"
                                />
                            </div>

                            {/* Location with autocomplete */}
                            <div className="relative sm:w-64 group/input" ref={locationWrapperRef}>
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 z-10 pointer-events-none transition-colors group-focus-within/input:text-violet-400" />
                                <Input
                                    placeholder="Şehir veya ülke..."
                                    value={location}
                                    onChange={(e) => handleLocationChange(e.target.value)}
                                    onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                                    onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false) }}
                                    autoComplete="off"
                                    className="bg-zinc-900/50 border-white/5 pl-11 h-12 text-white text-[15px] rounded-2xl focus:border-violet-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-violet-500/10 placeholder:text-zinc-600 transition-all shadow-inner"
                                />
                                {showSuggestions && locationSuggestions.length > 0 && (
                                    <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-[#121216] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-1.5">
                                        {locationSuggestions.map((suggestion) => (
                                            <li
                                                key={suggestion}
                                                onMouseDown={(e) => {
                                                    e.preventDefault()
                                                    setLocation(suggestion)
                                                    setShowSuggestions(false)
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-zinc-300 hover:bg-violet-600 hover:text-white cursor-pointer transition-all"
                                            >
                                                <MapPin className="h-4 w-4 opacity-70 shrink-0" />
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Search button */}
                            <Button
                                type="submit"
                                disabled={status === 'searching' || !keyword.trim()}
                                className="h-12 px-10 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] hover:-translate-y-0.5 transition-all duration-300 font-bold text-[15px] shrink-0 active:translate-y-0 border border-white/10"
                            >
                                {status === 'searching' ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Aranıyor...</>
                                ) : (
                                    <><Search className="mr-2 h-4 w-4" /> İlan Bul</>
                                )}
                            </Button>
                        </div>

                        {/* Filter toggle */}
                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`
                                    flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-300
                                    ${showFilters || hasActiveFilters
                                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-300 shadow-[0_0_15px_rgba(124,58,237,0.15)]'
                                        : 'bg-transparent border-white/5 text-zinc-400 hover:text-white hover:border-white/10 hover:bg-white/5'
                                    }
                                `}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filtreler
                                {hasActiveFilters && (
                                    <span className="ml-1 flex h-5 w-5 items-center justify-center bg-violet-500 text-white text-[10px] rounded-full font-bold shadow-sm">
                                        {[datePosted, jobType, experienceLevel].filter(Boolean).length}
                                    </span>
                                )}
                                {showFilters ? <ChevronUp className="h-4 w-4 ml-1 opacity-70" /> : <ChevronDown className="h-4 w-4 ml-1 opacity-70" />}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={() => { setDatePosted(''); setJobType(''); setExperienceLevel('') }}
                                    className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-rose-400 transition-colors px-2"
                                >
                                    <X className="h-3.5 w-3.5" /> Tümünü Temizle
                                </button>
                            )}
                        </div>

                        {/* Filter panel */}
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 mt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">

                                {/* Date Posted */}
                                <div>
                                    <p className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">
                                        <Clock className="h-3.5 w-3.5" /> İlan Tarihi
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {DATE_OPTIONS.map((opt) => (
                                            <FilterPill
                                                key={opt.value}
                                                label={opt.label}
                                                selected={datePosted === opt.value}
                                                onClick={() => setDatePosted(v => v === opt.value ? '' : opt.value)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Job Type */}
                                <div>
                                    <p className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">
                                        <Briefcase className="h-3.5 w-3.5" /> İş Tipi
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {JOB_TYPE_OPTIONS.map((opt) => (
                                            <FilterPill
                                                key={opt.value}
                                                label={opt.label}
                                                selected={jobType === opt.value}
                                                onClick={() => setJobType(v => v === opt.value ? '' : opt.value)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <p className="flex items-center gap-2 text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">
                                        <Users className="h-3.5 w-3.5" /> Deneyim Seviyesi
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPERIENCE_OPTIONS.map((opt) => (
                                            <FilterPill
                                                key={opt.value}
                                                label={opt.label}
                                                selected={experienceLevel === opt.value}
                                                onClick={() => setExperienceLevel(v => v === opt.value ? '' : opt.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Loading skeletons */}
            {status === 'searching' && (
                <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-4 px-2">
                        <div className="relative flex h-4 w-4 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </div>
                        <p className="text-zinc-400 text-sm font-medium animate-pulse">
                            LinkedIn global ağı taranıyor... Bu işlem birkaç saniye sürebilir.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {status === 'done' && jobs.length === 0 && (
                <div className="relative overflow-hidden flex flex-col items-center justify-center py-24 text-center border border-white/5 rounded-3xl bg-zinc-900/20 backdrop-blur-sm mt-8">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
                    <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10 relative">
                        <Briefcase className="h-10 w-10 text-zinc-500 absolute" />
                        <div className="absolute inset-0 border-2 border-violet-500/20 rounded-full animate-ping [animation-duration:3s]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Hedefine Uygun İlan Bulunamadı</h3>
                    <p className="text-zinc-400 max-w-md text-[15px] leading-relaxed">
                        Seçtiğin kriterlerde aktif bir ilan şu an için yok gibi görünüyor. Anahtar kelimeleri kısaltmayı veya <span className="text-violet-400 font-medium">filtreleri esnetmeyi</span> deneyebilirsin.
                    </p>
                    <Button
                        onClick={() => { setDatePosted(''); setJobType(''); setExperienceLevel(''); setKeyword('') }}
                        variant="ghost"
                        className="mt-6 text-violet-400 hover:text-white hover:bg-violet-600/20 transition-colors rounded-xl px-6"
                    >
                        <X className="h-4 w-4 mr-2" /> Aramayı Temizle ve Baştan Başla
                    </Button>
                </div>
            )}

            {/* Results */}
            {status === 'done' && jobs.length > 0 && (
                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5 px-2">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded-lg px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                                {jobs.length} İlan
                            </span>
                            <span className="text-sm font-medium text-zinc-400">
                                {location ? (
                                    <>
                                        "<span className="text-white">{keyword}</span>" aranıyor — <span className="text-violet-300">{location}</span>
                                    </>
                                ) : (
                                    <>
                                        "<span className="text-white">{keyword}</span>" aranıyor
                                    </>
                                )}
                            </span>
                        </div>
                        <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> En Yeniler Önce
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job, idx) => (
                            <JobCard
                                key={idx}
                                job={job}
                                onCreateCV={() => {
                                    if (job.link) {
                                        router.push(`/dashboard/cv/new?jobUrl=${encodeURIComponent(job.link)}`)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

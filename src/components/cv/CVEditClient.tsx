'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CVData } from '@/types/cv'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save, ArrowLeft, Loader2, Upload, Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

interface CVEditClientProps {
    cvId: string
    initialData: CVData
    showWatermark?: boolean
}

// Inline düzenleme yapabilmek için basit ve tasarımsız bir içerik düzenleyici (contenteditable) wrapper'ı
const EditableField = ({
    value,
    onChange,
    className = "",
    tag: Tag = "span",
    placeholder = "Girmek için tıklayın...",
    style = {}
}: {
    value: string | undefined,
    onChange: (val: string) => void,
    className?: string,
    tag?: string | React.ElementType,
    placeholder?: string,
    style?: React.CSSProperties
}) => {
    // string elementleri JSX tag olarak kullanabilmek için CustomTag tanımı
    const CustomTag = Tag as any
    return (
        <CustomTag
            className={`outline-none cursor-text hover:bg-black/5 hover:ring-1 hover:ring-violet-400/50 rounded-sm px-1 -mx-1 transition-all ${!value ? 'text-zinc-400 italic' : ''} ${className}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
                const text = e.target.innerText
                if (text !== value) {
                    onChange(text)
                }
            }}
            style={style}
        >
            {value || placeholder}
        </CustomTag>
    )
}

export default function CVEditClient({ cvId, initialData, showWatermark = false }: CVEditClientProps) {
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)
    const [cv, setCv] = useState<CVData>(initialData)
    const [profileImage, setProfileImage] = useState<string | null>(initialData.personal?.profileImage || null)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Profil resmini de json içerisine dahil ediyoruz
            const finalCvData = {
                ...cv,
                personal: {
                    ...cv.personal,
                    profileImage: profileImage || undefined
                }
            }

            const res = await fetch(`/api/cv/${cvId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updatedJson: finalCvData })
            })

            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Kaydetme başarısız')

            toast.success('CV başarıyla güncellendi!')
            router.push(`/dashboard/cv/${cvId}`)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Bir hata oluştu')
        } finally {
            setIsSaving(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setProfileImage(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Basit obje güncelleme fonksiyonu
    const updateField = (section: keyof CVData, field: string, value: any) => {
        setCv(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [field]: value
            }
        }))
    }

    // Array içi nesneleri güncelleme (Deneyim, Eğitim vb.)
    const updateArrayItem = (section: keyof CVData, index: number, field: string, value: string) => {
        setCv(prev => {
            const arr = [...(prev[section] as any[])]
            arr[index] = { ...arr[index], [field]: value }
            return { ...prev, [section]: arr }
        })
    }

    // Yetenek (Array of strings) güncelleme
    const updateArrayString = (section: 'technical' | 'soft' | 'languages', value: string) => {
        const arr = value.split(',').map(s => s.trim()).filter(Boolean)
        setCv(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [section]: arr
            }
        }))
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* BAŞLIK VE BUTONLAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm sticky top-4 z-50">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="border-zinc-700 hover:bg-zinc-800">
                        <ArrowLeft className="w-4 h-4 text-zinc-300" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            Inline Düzenleme Modu <span className="bg-amber-500/20 text-amber-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">BETA</span>
                        </h1>
                        <p className="text-xs text-zinc-400">Üzerine tıklayarak doğrudan CV üzerinden değişiklik yapabilirsin.</p>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </Button>
            </div>

            {/* İNTERAKTİF CV RENDERER */}
            <div className="flex justify-center p-4">
                <div
                    id="cv-content"
                    className="relative overflow-hidden bg-white text-zinc-900 shadow-2xl ring-1 ring-zinc-200/50 rounded-md"
                    style={{
                        width: '100%',
                        maxWidth: '210mm',
                        minHeight: '297mm',
                        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                        fontSize: '10pt',
                        lineHeight: '1.6',
                        boxSizing: 'border-box',
                        display: 'flex',
                        background: '#ffffff',
                    }}
                >
                    {/* WATERMARK */}
                    {showWatermark && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '12mm',
                                right: '18mm',
                                fontSize: '7pt',
                                color: '#d1d5db',
                                fontStyle: 'italic',
                                zIndex: 10,
                            }}
                        >
                            Powered by CVAI
                        </div>
                    )}

                    {/* SOL KOLON */}
                    <div
                        style={{
                            width: '32%',
                            backgroundColor: '#1e293b',
                            color: '#f8fafc',
                            padding: '12mm 8mm',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8mm',
                        }}
                    >
                        {/* PROFIL FOTOĞRAFI */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4mm' }}>
                            <label
                                style={{
                                    width: '32mm',
                                    height: '32mm',
                                    borderRadius: '50%',
                                    backgroundColor: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    border: '3pt solid #475569',
                                    position: 'relative',
                                }}
                                className="group ring-offset-2 ring-offset-[#1e293b] hover:ring-2 hover:ring-violet-400 transition-all"
                            >
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            console.error('LinkedIn Profile Image Error:', e)
                                            setProfileImage(null)
                                        }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Upload className="text-zinc-400 opacity-50 w-8 h-8 group-hover:opacity-100 transition-opacity" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="text-white w-6 h-6" />
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <EditableField
                                    tag="h1"
                                    value={cv.personal?.name}
                                    onChange={(val) => updateField('personal', 'name', val)}
                                    style={{ fontSize: '18pt', fontWeight: 800, margin: 0, lineHeight: '1.2' }}
                                />
                                <div style={{ color: '#94a3b8', fontSize: '9.5pt', marginTop: '2mm', fontWeight: 500 }}>
                                    <EditableField
                                        value={cv.experience?.[0]?.title}
                                        onChange={(val) => {
                                            // Sadece görüntüyü düzelt (ilk deneyim yoksa boş kalır varsayalım)
                                            if (cv.experience && cv.experience.length > 0) {
                                                updateArrayItem('experience', 0, 'title', val)
                                            }
                                        }}
                                        placeholder="Ünvan (Örn: Software Engineer)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* İLETİŞİM */}
                        <div>
                            <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#e2e8f0', borderBottom: '1pt solid #475569', paddingBottom: '2mm', marginBottom: '4mm' }}>
                                İLETİŞİM
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5mm', fontSize: '8.5pt', color: '#cbd5e1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                    <Mail size={12} className="text-violet-400 shrink-0" />
                                    <EditableField value={cv.personal?.email} onChange={(val) => updateField('personal', 'email', val)} placeholder="Email adresi" className="break-all" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                    <Phone size={12} className="text-violet-400 shrink-0" />
                                    <EditableField value={cv.personal?.phone} onChange={(val) => updateField('personal', 'phone', val)} placeholder="Telefon numarası" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                    <MapPin size={12} className="text-violet-400 shrink-0" />
                                    <EditableField value={cv.personal?.location} onChange={(val) => updateField('personal', 'location', val)} placeholder="Konum" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                    <Linkedin size={12} className="text-violet-400 shrink-0" />
                                    <EditableField value={cv.personal?.linkedin} onChange={(val) => updateField('personal', 'linkedin', val)} placeholder="LinkedIn URL" className="break-all" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                    <Globe size={12} className="text-violet-400 shrink-0" />
                                    <EditableField value={cv.personal?.portfolio} onChange={(val) => updateField('personal', 'portfolio', val)} placeholder="Portfolyo / Website" className="break-all" />
                                </div>
                            </div>
                        </div>

                        {/* EĞİTİM */}
                        {cv.education && cv.education.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#e2e8f0', borderBottom: '1pt solid #475569', paddingBottom: '2mm', marginBottom: '4mm' }}>
                                    EĞİTİM
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4mm' }}>
                                    {cv.education.map((edu, i) => (
                                        <div key={i}>
                                            <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#f8fafc' }}>
                                                <EditableField value={edu.degree} onChange={(val) => updateArrayItem('education', i, 'degree', val)} />
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '8.5pt', marginTop: '1pt' }}>
                                                <EditableField value={edu.school} onChange={(val) => updateArrayItem('education', i, 'school', val)} />
                                            </div>
                                            <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '1pt' }}>
                                                <EditableField value={edu.year} onChange={(val) => updateArrayItem('education', i, 'year', val)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DİLLER */}
                        <div>
                            <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#e2e8f0', borderBottom: '1pt solid #475569', paddingBottom: '2mm', marginBottom: '4mm' }}>
                                DİLLER
                            </h2>
                            <div style={{ fontSize: '9pt', color: '#cbd5e1' }}>
                                <EditableField
                                    tag="div"
                                    value={cv.skills?.languages?.join(', ')}
                                    onChange={(val) => updateArrayString('languages', val)}
                                    placeholder="Örn: İngilizce, Almanca (Virgülle ayırın)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON - İçerik */}
                    <div style={{ width: '68%', padding: '12mm 12mm' }}>

                        {/* ÖZET */}
                        <section style={{ marginBottom: '8mm' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5pt', marginBottom: '3mm' }}>
                                PROFESYONEL ÖZET
                            </h2>
                            <EditableField
                                tag="p"
                                value={cv.summary}
                                onChange={(val) => setCv(prev => ({ ...prev, summary: val }))}
                                style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '9.5pt', textAlign: 'justify' }}
                            />
                        </section>

                        {/* DENEYİM */}
                        {cv.experience && cv.experience.length > 0 && (
                            <section style={{ marginBottom: '8mm' }}>
                                <h2 style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5pt', marginBottom: '5mm', display: 'flex', alignItems: 'center' }}>
                                    İŞ DENEYİMİ
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6mm' }}>
                                    {cv.experience.map((exp, i) => (
                                        <div key={i} style={{ position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <div style={{ fontWeight: 700, fontSize: '11pt', color: '#0f172a' }}>
                                                    <EditableField value={exp.title} onChange={(val) => updateArrayItem('experience', i, 'title', val)} />
                                                </div>
                                                <div style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '8pt', backgroundColor: '#f1f5f9', padding: '1pt 4pt', borderRadius: '4px' }}>
                                                    <EditableField value={exp.startDate} onChange={(val) => updateArrayItem('experience', i, 'startDate', val)} /> – <EditableField value={exp.endDate} onChange={(val) => updateArrayItem('experience', i, 'endDate', val)} />
                                                </div>
                                            </div>
                                            <div style={{ color: '#4338ca', fontWeight: 600, fontSize: '10pt', marginTop: '1pt', marginBottom: '2.5mm' }}>
                                                <EditableField value={exp.company} onChange={(val) => updateArrayItem('experience', i, 'company', val)} />
                                                <span className="text-zinc-400 font-normal px-1">|</span>
                                                <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                                                    <EditableField value={exp.location} onChange={(val) => updateArrayItem('experience', i, 'location', val)} placeholder="Konum" />
                                                </span>
                                            </div>

                                            {exp.bullets && exp.bullets.length > 0 && (
                                                <ul style={{ margin: 0, paddingLeft: '4mm', listStyleType: 'disc', color: '#475569', fontSize: '9pt' }}>
                                                    {exp.bullets.map((bullet, j) => (
                                                        <li key={j} style={{ marginBottom: '1.5mm', paddingLeft: '1mm' }}>
                                                            {/* Nested Array Güncellemesi - Özel bir inline çözüm */}
                                                            <EditableField
                                                                value={bullet}
                                                                onChange={(val) => {
                                                                    setCv(prev => {
                                                                        const newExp = [...prev.experience]
                                                                        const newBullets = [...(newExp[i].bullets || [])]
                                                                        newBullets[j] = val
                                                                        newExp[i] = { ...newExp[i], bullets: newBullets }
                                                                        return { ...prev, experience: newExp }
                                                                    })
                                                                }}
                                                            />
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* YETENEKLER & UZMANLIK */}
                        <section style={{ marginBottom: '8mm' }}>
                            <h2 style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5pt', marginBottom: '4mm' }}>
                                UZMANLIK VE BECERİLER
                            </h2>

                            <div style={{ marginBottom: '4mm' }}>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#334155', marginBottom: '1.5mm' }}>Teknik Beceriler <span className="text-[10px] text-zinc-400 font-normal ml-2">(Virgülle ayırarak düzenleyin)</span></div>
                                <div style={{ fontSize: '9pt', color: '#475569', backgroundColor: '#f8fafc', padding: '2mm', borderRadius: '4px' }}>
                                    <EditableField
                                        tag="div"
                                        value={cv.skills?.technical?.join(', ')}
                                        onChange={(val) => updateArrayString('technical', val)}
                                        placeholder="React, Node.js, SQL vs."
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#334155', marginBottom: '1.5mm' }}>Kişisel Beceriler <span className="text-[10px] text-zinc-400 font-normal ml-2">(Virgülle ayırarak düzenleyin)</span></div>
                                <div style={{ fontSize: '9pt', color: '#475569', backgroundColor: '#f8fafc', padding: '2mm', borderRadius: '4px' }}>
                                    <EditableField
                                        tag="div"
                                        value={cv.skills?.soft?.join(', ')}
                                        onChange={(val) => updateArrayString('soft', val)}
                                        placeholder="İletişim, Liderlik vs."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

        </div>
    )
}

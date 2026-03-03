'use client'

import React, { useState } from 'react'
import type { CVData } from '@/types/cv'
import { Mail, Phone, MapPin, Linkedin, Globe, Upload } from 'lucide-react'

interface CVRendererProps {
    cv: CVData
    showWatermark?: boolean
}

export default function CVRenderer({ cv, showWatermark = false }: CVRendererProps) {
    const [profileImage, setProfileImage] = useState<string | null>(cv.personal?.profileImage || null)

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

    return (
        <div
            id="cv-content"
            className="relative mx-auto bg-white text-zinc-900 shadow-sm"
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

            {/* SOL KOLON - Vurgu Rengi (Koyu) */}
            <div
                style={{
                    width: '32%',
                    backgroundColor: '#1e293b', // slate-800
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
                        className="group"
                    >
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                    console.error('LinkedIn Profile Image Error:', e)
                                    // Eğer resim yüklenemezse veya expire olduysa yükleme ikonuna geri dön
                                    setProfileImage(null)
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Upload className="text-zinc-400 opacity-50 w-8 h-8 group-hover:opacity-100 transition-opacity" />
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '18pt', fontWeight: 800, margin: 0, lineHeight: '1.2' }}>
                            {cv.personal?.name}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '9.5pt', marginTop: '2mm', fontWeight: 500 }}>
                            {/* Headquarter/Role */}
                            {cv.experience?.[0]?.title ?? 'Profesyonel'}
                        </p>
                    </div>
                </div>

                {/* İLETİŞİM */}
                <div>
                    <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#e2e8f0', borderBottom: '1pt solid #475569', paddingBottom: '2mm', marginBottom: '4mm' }}>
                        İLETİŞİM
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5mm', fontSize: '8.5pt', color: '#cbd5e1' }}>
                        {cv.personal?.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                <Mail size={12} className="text-violet-400" />
                                <span style={{ wordBreak: 'break-all' }}>{cv.personal.email}</span>
                            </div>
                        )}
                        {cv.personal?.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                <Phone size={12} className="text-violet-400" />
                                <span>{cv.personal.phone}</span>
                            </div>
                        )}
                        {cv.personal?.location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                <MapPin size={12} className="text-violet-400" />
                                <span>{cv.personal.location}</span>
                            </div>
                        )}
                        {cv.personal?.linkedin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                <Linkedin size={12} className="text-violet-400" />
                                <span style={{ wordBreak: 'break-all' }}>{cv.personal.linkedin.replace('https://', '')}</span>
                            </div>
                        )}
                        {cv.personal?.portfolio && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                                <Globe size={12} className="text-violet-400" />
                                <span style={{ wordBreak: 'break-all' }}>{cv.personal.portfolio.replace('https://', '')}</span>
                            </div>
                        )}
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
                                    <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#f8fafc' }}>{edu.degree}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '8.5pt', marginTop: '1pt' }}>{edu.school}</div>
                                    <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '1pt' }}>{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DİLLER */}
                {cv.skills?.languages && cv.skills.languages.length > 0 && (
                    <div>
                        <h2 style={{ fontSize: '11pt', fontWeight: 700, color: '#e2e8f0', borderBottom: '1pt solid #475569', paddingBottom: '2mm', marginBottom: '4mm' }}>
                            DİLLER
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5mm', fontSize: '9pt', color: '#cbd5e1' }}>
                            {cv.skills.languages.map((lang, idx) => (
                                <div key={idx}>{lang}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SAĞ KOLON - İçerik */}
            <div style={{ width: '68%', padding: '12mm 12mm' }}>

                {/* ÖZET */}
                {cv.summary && (
                    <section style={{ marginBottom: '8mm' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5pt', marginBottom: '3mm' }}>
                            PROFESYONEL ÖZET
                        </h2>
                        <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '9.5pt', textAlign: 'justify' }}>
                            {cv.summary}
                        </p>
                    </section>
                )}

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
                                            {exp.title}
                                        </div>
                                        <div style={{ fontSize: '8.5pt', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap', marginLeft: '8pt', backgroundColor: '#f1f5f9', padding: '1pt 4pt', borderRadius: '4px' }}>
                                            {exp.startDate} – {exp.endDate}
                                        </div>
                                    </div>
                                    <div style={{ color: '#4338ca', fontWeight: 600, fontSize: '10pt', marginTop: '1pt', marginBottom: '2.5mm' }}>
                                        {exp.company}
                                        {exp.location && <span style={{ color: '#94a3b8', fontWeight: 400 }}> | {exp.location}</span>}
                                    </div>

                                    {exp.bullets && exp.bullets.length > 0 && (
                                        <ul style={{ margin: 0, paddingLeft: '4mm', listStyleType: 'disc', color: '#475569', fontSize: '9pt' }}>
                                            {exp.bullets.map((bullet, j) => (
                                                <li key={j} style={{ marginBottom: '1.5mm', paddingLeft: '1mm' }}>
                                                    {bullet}
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
                {cv.skills && (
                    <section style={{ marginBottom: '8mm' }}>
                        <h2 style={{ fontSize: '14pt', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5pt', marginBottom: '4mm' }}>
                            UZMANLIK VE BECERİLER
                        </h2>

                        {cv.skills.technical && cv.skills.technical.length > 0 && (
                            <div style={{ marginBottom: '3mm' }}>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#334155', marginBottom: '1.5mm' }}>Teknik Beceriler</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm' }}>
                                    {cv.skills.technical.map((skill, k) => (
                                        <div key={k} style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '8pt', padding: '1mm 2.5mm', borderRadius: '4px', fontWeight: 600 }}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {cv.skills.soft && cv.skills.soft.length > 0 && (
                            <div>
                                <div style={{ fontSize: '9pt', fontWeight: 700, color: '#334155', marginBottom: '1.5mm' }}>Kişisel Beceriler</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm' }}>
                                    {cv.skills.soft.map((skill, k) => (
                                        <div key={k} style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '8pt', padding: '1mm 2.5mm', borderRadius: '4px', fontWeight: 500 }}>
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* SERTİFİKALAR VE PROJELER */}
                <div style={{ display: 'flex', gap: '6mm', width: '100%' }}>
                    {cv.certifications && cv.certifications.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', marginBottom: '3mm' }}>SERTİFİKALAR</h2>
                            <ul style={{ paddingLeft: '4mm', margin: 0, fontSize: '9pt', color: '#475569' }}>
                                {cv.certifications.map((cert, k) => (
                                    <li key={k} style={{ marginBottom: '1.5mm' }}>{cert}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {cv.projects && cv.projects.length > 0 && (
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '12pt', fontWeight: 800, color: '#0f172a', marginBottom: '3mm' }}>ÖNEMLİ PROJELER</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3mm' }}>
                                {cv.projects.map((proj, k) => (
                                    <div key={k}>
                                        <div style={{ fontWeight: 700, fontSize: '9.5pt', color: '#1e293b' }}>{proj.name}</div>
                                        <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '1pt' }}>{proj.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

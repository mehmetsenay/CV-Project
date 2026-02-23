import type { CVData } from '@/types/cv'
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react'

interface CVRendererProps {
    cv: CVData
    showWatermark?: boolean
}

export default function CVRenderer({ cv, showWatermark = false }: CVRendererProps) {
    return (
        <div
            id="cv-content"
            className="relative mx-auto bg-white text-zinc-900"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '16mm 18mm',
                fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
                fontSize: '9.5pt',
                lineHeight: '1.5',
                boxSizing: 'border-box',
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
                    }}
                >
                    Powered by CVAI
                </div>
            )}

            {/* HEADER — Ad, İletişim */}
            <header style={{ marginBottom: '10mm', borderBottom: '2pt solid #7c3aed', paddingBottom: '6mm' }}>
                <h1
                    style={{
                        fontSize: '22pt',
                        fontWeight: 800,
                        color: '#0f172a',
                        margin: 0,
                        letterSpacing: '-0.5pt',
                    }}
                >
                    {cv.personal?.name}
                </h1>

                {/* İletişim bilgileri */}
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12pt',
                        marginTop: '4mm',
                        fontSize: '8.5pt',
                        color: '#475569',
                    }}
                >
                    {cv.personal?.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                            <span>✉</span> {cv.personal.email}
                        </span>
                    )}
                    {cv.personal?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                            <span>☎</span> {cv.personal.phone}
                        </span>
                    )}
                    {cv.personal?.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                            <span>⌖</span> {cv.personal.location}
                        </span>
                    )}
                    {cv.personal?.linkedin && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                            <span>in</span> {cv.personal.linkedin}
                        </span>
                    )}
                    {cv.personal?.portfolio && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                            <span>⊕</span> {cv.personal.portfolio}
                        </span>
                    )}
                </div>
            </header>

            {/* ÖZET */}
            {cv.summary && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Özet</SectionTitle>
                    <p style={{ margin: '3mm 0 0', color: '#374151', lineHeight: 1.6 }}>
                        {cv.summary}
                    </p>
                </section>
            )}

            {/* DENEYİM */}
            {cv.experience && cv.experience.length > 0 && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Deneyim</SectionTitle>
                    <div style={{ marginTop: '3mm' }}>
                        {cv.experience.map((exp, i) => (
                            <div key={i} style={{ marginBottom: i < cv.experience.length - 1 ? '6mm' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '10.5pt', color: '#0f172a' }}>
                                            {exp.title}
                                        </div>
                                        <div style={{ color: '#7c3aed', fontWeight: 600, fontSize: '9pt' }}>
                                            {exp.company}
                                            {exp.location && (
                                                <span style={{ color: '#6b7280', fontWeight: 400 }}>
                                                    {' '}· {exp.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '8.5pt',
                                            color: '#6b7280',
                                            whiteSpace: 'nowrap',
                                            marginLeft: '8pt',
                                        }}
                                    >
                                        {exp.startDate} – {exp.endDate}
                                    </div>
                                </div>

                                {exp.bullets && exp.bullets.length > 0 && (
                                    <ul
                                        style={{
                                            margin: '2.5mm 0 0',
                                            paddingLeft: '4mm',
                                            listStyleType: 'none',
                                        }}
                                    >
                                        {exp.bullets.map((bullet, j) => (
                                            <li
                                                key={j}
                                                style={{
                                                    color: '#374151',
                                                    marginBottom: '1.5mm',
                                                    display: 'flex',
                                                    gap: '4pt',
                                                }}
                                            >
                                                <span style={{ color: '#7c3aed', fontWeight: 700, flexShrink: 0 }}>▸</span>
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

            {/* EĞİTİM */}
            {cv.education && cv.education.length > 0 && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Eğitim</SectionTitle>
                    <div style={{ marginTop: '3mm' }}>
                        {cv.education.map((edu, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '3mm',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{edu.school}</div>
                                    <div style={{ color: '#475569', fontSize: '9pt' }}>{edu.degree}</div>
                                </div>
                                <div style={{ fontSize: '8.5pt', color: '#6b7280' }}>{edu.year}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* BECERİLER */}
            {cv.skills && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Beceriler</SectionTitle>
                    <div style={{ marginTop: '3mm', display: 'flex', flexDirection: 'column', gap: '2.5mm' }}>
                        {cv.skills.technical && cv.skills.technical.length > 0 && (
                            <SkillsRow label="Teknik" skills={cv.skills.technical} />
                        )}
                        {cv.skills.soft && cv.skills.soft.length > 0 && (
                            <SkillsRow label="Kişisel" skills={cv.skills.soft} />
                        )}
                        {cv.skills.languages && cv.skills.languages.length > 0 && (
                            <SkillsRow label="Diller" skills={cv.skills.languages} />
                        )}
                    </div>
                </section>
            )}

            {/* SERTİFİKALAR */}
            {cv.certifications && cv.certifications.length > 0 && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Sertifikalar</SectionTitle>
                    <div style={{ marginTop: '3mm' }}>
                        {cv.certifications.map((cert, i) => (
                            <div key={i} style={{ color: '#374151', marginBottom: '1.5mm', display: 'flex', gap: '4pt' }}>
                                <span style={{ color: '#7c3aed' }}>▸</span> {cert}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJELER */}
            {cv.projects && cv.projects.length > 0 && (
                <section style={{ marginBottom: '8mm' }}>
                    <SectionTitle>Projeler</SectionTitle>
                    <div style={{ marginTop: '3mm' }}>
                        {cv.projects.map((proj, i) => (
                            <div key={i} style={{ marginBottom: '4mm' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                    {proj.name}
                                    {proj.url && (
                                        <span style={{ fontWeight: 400, color: '#7c3aed', fontSize: '8.5pt', marginLeft: '6pt' }}>
                                            {proj.url}
                                        </span>
                                    )}
                                </div>
                                <div style={{ color: '#374151', marginTop: '1mm' }}>{proj.description}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: '10pt',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '1pt',
                color: '#0f172a',
                borderBottom: '1pt solid #e2e8f0',
                paddingBottom: '2mm',
                marginBottom: '1mm',
            }}
        >
            {children}
        </div>
    )
}

function SkillsRow({ label, skills }: { label: string; skills: string[] }) {
    return (
        <div style={{ display: 'flex', gap: '6pt', flexWrap: 'wrap', alignItems: 'baseline' }}>
            <span style={{ fontSize: '8.5pt', fontWeight: 700, color: '#475569', minWidth: '50pt' }}>
                {label}:
            </span>
            <span style={{ color: '#374151' }}>{skills.join(' · ')}</span>
        </div>
    )
}

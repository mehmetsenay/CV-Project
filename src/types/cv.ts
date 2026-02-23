// CV JSON formatı — AI tarafından üretilen yapı
export interface CVPersonal {
    name: string
    email: string
    phone?: string
    location?: string
    linkedin?: string
    portfolio?: string
}

export interface CVExperience {
    company: string
    title: string
    startDate: string
    endDate: string
    location?: string
    bullets: string[]
}

export interface CVEducation {
    school: string
    degree: string
    year: string
}

export interface CVSkills {
    technical: string[]
    soft: string[]
    languages: string[]
}

export interface CVData {
    personal: CVPersonal
    summary: string
    experience: CVExperience[]
    education: CVEducation[]
    skills: CVSkills
    certifications: string[]
    projects: {
        name: string
        description: string
        url?: string
    }[]
    ats_score: number
    matched_keywords: string[]
}

// Veritabanı satır tipleri
export interface CVRecord {
    id: string
    user_id: string
    title: string
    linkedin_url?: string
    job_url?: string
    base_linkedin_json?: Record<string, unknown>
    target_job_json?: Record<string, unknown>
    ai_tailored_cv_json?: CVData
    ats_score?: number
    status: 'pending' | 'scraping' | 'generating' | 'completed' | 'error'
    error_message?: string
    created_at: string
    updated_at: string
}

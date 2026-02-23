// Supabase veritabanı tablo tipleri
export interface UserProfile {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
    stripe_customer_id?: string
    stripe_subscription_id?: string
    subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid' | 'inactive'
    trial_end_date?: string
    subscription_end_date?: string
    plan_type: 'pro' | 'lifetime' | 'team'
    created_at: string
    updated_at: string
}

export interface ShareableLink {
    id: string
    user_id: string
    cv_id: string
    slug: string
    view_count: number
    last_viewed_at?: string
    is_active: boolean
    created_at: string
}

export interface LinkAnalytics {
    id: string
    link_id: string
    viewer_ip?: string
    viewer_country?: string
    viewer_device?: string
    referrer?: string
    viewed_at: string
}

// Stripe ile ilgili tipler
export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'canceled'
    | 'past_due'
    | 'unpaid'
    | 'inactive'

export interface StripeCheckoutSession {
    url: string
}

export interface StripePortalSession {
    url: string
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNavbar from '@/components/dashboard/DashboardNavbar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Kullanıcı profilini çek
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen relative selection:bg-violet-500/30">
            <div className="relative z-10 flex flex-col min-h-screen">
                <DashboardNavbar user={user} profile={profile} />
                <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ObservatoryLoginForm, ObservatorySignupForm } from '../auth/ObservatoryAuthForms'

const ObservatoryLoginPage = () => {
  const router = useRouter()
  return (
    <main className="light-page min-h-screen bg-[#fffff8] px-3 py-10 text-[#1f1f1f]">
      <div className="mx-auto grid max-w-[860px] gap-8 pt-10 md:grid-cols-2">
        <section className="grid content-start gap-4">
          <div className="text-[12px] uppercase tracking-[0.5px] text-[#8a8375]">Observatory</div>
          <h1 className="m-0 text-[42px] leading-[0.95] font-medium">Recommendation app for your own taste profile.</h1>
          <p className="m-0 max-w-[420px] text-[15px] leading-[1.5] text-[#575145]">
            Add approved domains and seed URLs from your own writing, let Observatory infer a profile, and keep a regularly refreshed feed tuned by prompting and feedback.
          </p>
          <p className="m-0 text-[13px] text-[#7b7466]">
            Feed data stays in an isolated Observatory database so the product can move into its own codebase later without dragging the rest of the app along.
          </p>
          <Link href="/" className="text-[12px] text-[#6b665b] no-underline hover:text-[#1f1f1f]">Back to route list</Link>
        </section>
        <section className="grid gap-6">
          <div className="grid gap-2 bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Login</div>
            <ObservatoryLoginForm onSuccess={() => router.replace('/observatory/foryou')} />
          </div>
          <div className="grid gap-2 bg-[#f6f2e5] p-4">
            <div className="text-[12px] uppercase tracking-[0.5px]">Create account</div>
            <ObservatorySignupForm onSuccess={() => router.replace('/observatory/foryou')} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default ObservatoryLoginPage

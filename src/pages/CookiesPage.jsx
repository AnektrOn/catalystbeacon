import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'

const CookiesPage = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Data usage &amp; cookies</h1>
          <Button asChild variant="outline" className="shrink-0">
            <Link to="/signup">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Link>
          </Button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-semibold mb-3">How we use data</h2>
            <p className="text-muted-foreground">
              We use account and usage information to run the Human Catalyst Beacon platform, improve your experience,
              and meet legal obligations. For full details, see our{' '}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cookies &amp; similar technologies</h2>
            <p className="text-muted-foreground mb-2">
              We may use cookies and local storage to keep you signed in, remember preferences, and measure site
              performance. You can control cookies through your browser settings; blocking essential cookies may affect
              sign-in and core features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions about this notice can be sent through the contact options listed on our website or in your
              account settings.
            </p>
          </section>
        </div>
      </div>
    </AuthLayout>
  )
}

export default CookiesPage

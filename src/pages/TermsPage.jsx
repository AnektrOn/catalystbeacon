import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';

const TermsPage = () => {
  return (
    <AuthLayout>
      <div className="w-full max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <Button asChild variant="outline">
            <Link to="/signup">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Link>
          </Button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Human Catalyst University, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground mb-2">
              Permission is granted to temporarily access the materials on Human Catalyst University's website for personal, non-commercial transitory viewing only.
            </p>
            <p className="text-muted-foreground">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by Human Catalyst University at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
            <p className="text-muted-foreground mb-2">
              You are responsible for maintaining the confidentiality of your account and password. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Content and Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this platform, including courses, materials, and resources, is the property of Human Catalyst University and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="text-muted-foreground mb-2">
              Subscription fees are charged in advance on a monthly or annual basis. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Pay all fees associated with your subscription</li>
              <li>Automatic renewal unless cancelled</li>
              <li>No refunds for partial subscription periods</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
            <p className="text-muted-foreground mb-2">
              You may not use our service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Human Catalyst University shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through our support channels.
            </p>
          </section>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default TermsPage;

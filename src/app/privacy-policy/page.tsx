
'use client';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex items-center py-2 mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </header>

        <main className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Averon Workforce – Privacy Policy</h1>
            <p className="text-muted-foreground">Effective Date: January 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">1. Overview</h2>
            <p>This Privacy Policy explains how Averon Workforce (“we”, “our”, “us”) collects, uses, stores, and protects your personal information across the AverPay platform.</p>
            <p>By using our services, you consent to the data practices described here.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">2. Information We Collect</h2>
            <p>We may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Identification:</strong> Full name, Date of birth, Address, Email, Phone number, Profile photo, Government ID for verification</li>
              <li><strong>Account & Usage Data:</strong> Login information, Device/IP logs, Dashboard activity, Project submissions, Transaction history</li>
              <li><strong>Financial Information:</strong> Payment receipts, Withdrawal account details, Activation fees, Compliance documents</li>
            </ul>
            <p>All financial data is encrypted and securely stored.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">3. How We Use Your Data</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create and manage your AverPay profile</li>
              <li>Assign and track freelance projects</li>
              <li>Process payments and withdrawals</li>
              <li>Verify your identity</li>
              <li>Maintain platform security</li>
              <li>Communicate updates, approvals, and assignments</li>
              <li>Improve user experience and service quality</li>
            </ul>
            <p>We do not sell, trade, or rent user data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">4. Data Sharing</h2>
            <p>We may share limited data only with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processors</li>
              <li>Compliance verification partners</li>
              <li>IT/security service providers</li>
              <li>Legal authorities (if required by law)</li>
            </ul>
            <p>We do not share your information for marketing purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">5. Cookies & Tracking</h2>
            <p>AverPay may use cookies for:</p>
             <ul className="list-disc pl-6 space-y-2">
                <li>Login security</li>
                <li>Session tracking</li>
                <li>Fraud prevention</li>
                <li>User preferences</li>
            </ul>
            <p>Users may disable cookies, but some features may not function fully.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">6. Data Security</h2>
            <p>We implement:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>SSL encryption</li>
                <li>Multi-layer authentication</li>
                <li>Internal access restriction</li>
                <li>Secure cloud storage</li>
                <li>Regular server audits</li>
            </ul>
            <p>However, no system is 100% secure; users are responsible for safeguarding login credentials.</p>
          </section>

           <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">7. Member Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request corrections or updates</li>
                <li>Request account deletion</li>
                <li>Request data export</li>
                <li>Withdraw consent for processing</li>
                <li>Decline email notifications</li>
            </ul>
            <p>Account deletion requires completion of financial and compliance obligations.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">8. Data Retention</h2>
            <p>We retain:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Basic profile records for compliance</li>
                <li>Transaction history as required by financial regulations</li>
                <li>Project data for internal quality and audit</li>
                <li>Communication logs when legally necessary</li>
            </ul>
            <p>If you close your account, we retain only what is required for legal & audit purposes.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">9. Third-Party Links</h2>
            <p>AverPay may include external links. We are not responsible for external site policies or actions.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy occasionally. Continued use of AverPay means you accept the updated policy.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">11. Contact</h2>
            <p>For privacy-related concerns, members may contact the Averon Workforce support office.</p>
          </section>
        </main>
      </div>
    </div>
  );
}

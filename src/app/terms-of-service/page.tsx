
'use client';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl font-bold mb-2">Averon Workforce – Terms of Service (TOS)</h1>
            <p className="text-muted-foreground">Effective Date: January 2025</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">1. Introduction</h2>
            <p>Welcome to Averon Workforce (“Company”, “we”, “our”, “us”). These Terms of Service govern your use of the AverPay platform, our freelance recruitment services, project management systems, communication tools, and all related services.</p>
            <p>By creating a profile, accessing AverPay, or participating in any Averon Workforce program, you acknowledge that you have read, understood, and agreed to these Terms.</p>
            <p>If you do not agree, you must discontinue use of our services immediately.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">2. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Submit accurate and truthful registration information</li>
              <li>Not be restricted by law from performing freelance work</li>
              <li>Comply with all verification and account-creation procedures</li>
              <li>Maintain only one active Averon Workforce/AverPay account</li>
            </ul>
            <p>Averon Workforce reserves the right to accept or decline applications at our discretion.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">3. Member Registration & PROFILE CREATION FEE</h2>
            <p>To access paid freelance projects, members must maintain an active AverPay profile.</p>
            <p>A €25 one-time PROFILE CREATION FEE is required to activate or reopen a profile.</p>
            <p>This fee supports identity verification, profile security, compliance processing, and automated system setup.</p>
            <p>The fee may be paid before or after the first project assignment, depending on member preference.</p>
            <p>Refunds for profile fees may be issued only in accordance with our Account Closure Policy.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">4. Company ID Requirement</h2>
            <p>For internal security and client confidentiality:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Each member receives a unique Averon Workforce ID number.</li>
                <li>This ID must be included on every project submission.</li>
                <li>Projects submitted without an ID cannot be reviewed, approved, or paid.</li>
                <li>ID cards must be purchased and fully activated before members can withdraw earnings.</li>
                <li>Failure to provide a valid ID number may result in rejection of submissions.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">5. Project Assignments & Delivery</h2>
            <p>Members may receive:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Product review projects</li>
                <li>Graphic design assignments</li>
                <li>Branding or content-based tasks</li>
                <li>Other freelance projects as made available by our clients</li>
            </ul>
            <p>Project approval is based on:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Quality</li>
                <li>Accuracy</li>
                <li>Completion within deadline</li>
                <li>Compliance with project instructions</li>
                <li>Consistency with client guidelines</li>
            </ul>
            <p>Averon Workforce reserves the right to reassign, reject, or revise any work that does not meet standards.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">6. Earnings & Payments</h2>
            <p>Members earn according to project value and client agreements.</p>
            <p>Payment Release Conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Only approved projects generate earnings.</li>
                <li>Earnings are deposited into the member’s AverPay Payroll Account.</li>
                <li>Members must activate their profile before withdrawal.</li>
                <li>Funds may be withdrawn to any supported bank account or card once verification is complete.</li>
            </ul>
            <h3 className="font-semibold pt-2">Security & System Fees</h3>
            <p>In certain cases, system/network fees, server maintenance fees, or regulatory verification charges may apply to enable secure withdrawals. These fees are never deducted automatically without notice.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">7. Prohibited Conduct</h2>
            <p>Members agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Share or leak confidential client information</li>
                <li>Replicate, publish, or redistribute assigned project materials</li>
                <li>Impersonate staff or misrepresent affiliation</li>
                <li>Use AverPay for fraudulent or malicious activity</li>
                <li>Attempt to bypass verification procedures</li>
                <li>Abuse or disrespect staff or other members</li>
                <li>Create multiple accounts</li>
            </ul>
            <p>Violations may result in account suspension, termination, or legal action.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">8. Confidentiality Agreement</h2>
            <p>All Averon Workforce members are bound by strict confidentiality, including:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Client identity</li>
                <li>Project content</li>
                <li>Payment structure</li>
                <li>Internal communications</li>
                <li>AverPay system details</li>
                <li>Member-only processes</li>
            </ul>
            <p>Disclosure of confidential information may result in immediate account termination and legal consequences.</p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">9. Intellectual Property</h2>
            <p>All project materials, client briefs, templates, and brand assets remain the exclusive property of Averon Workforce or its clients.</p>
            <p>Members are contractually prohibited from claiming ownership or authorship of any project elements provided.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">10. Account Closure & Refund Policy</h2>
            <p>Members may request account closure at any time.</p>
            <p>Upon closure:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Any deposits made by the member are refundable minus a 3% administrative fee,</li>
                <li>Refunds cannot be issued if the member has pending earnings that cannot be accessed due to incomplete activation.</li>
                <li>Currency conversion fees (if applicable) may be required before processing refund.</li>
                <li>Member must agree not to disclose any company information, client details, or project content.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">11. Limitation of Liability</h2>
            <p>Averon Workforce is not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>Banking delays</li>
                <li>Member-side technical issues</li>
                <li>Rejected transactions due to bank restrictions</li>
                <li>Losses caused by incorrect member information</li>
                <li>Force majeure incidents</li>
            </ul>
            <p>Our total liability shall not exceed the amount paid by the member for profile creation or ID services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">12. Amendments</h2>
            <p>Averon Workforce may update these Terms at any time. Updates will be posted on the AverPay login page. Continued use of the platform indicates acceptance of the revised Terms.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">13. Governing Law</h2>
            <p>These Terms are governed by applicable international freelance, digital service, and commercial regulations.</p>
          </section>
        </main>
      </div>
    </div>
  );
}

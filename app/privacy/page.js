'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(250,204,21,0.1)' }}>
        <Link href="/" style={{ color: 'rgba(250,204,21,0.6)' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(250,204,21,0.15)', border: '1px solid rgba(250,204,21,0.3)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="#FACC15" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-wide">JIMAT</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 pb-20">
        {/* Title */}
        <div className="mb-8">
          <p className="text-xs mb-2" style={{ color: 'rgba(250,204,21,0.6)' }}>⚡ Legal Document</p>
          <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Last updated: June 2026 · AWAS Premium Resources (SSM 202603141446)
          </p>
        </div>

        <div className="space-y-8" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>

          {/* Section */}
          {[
            {
              title: '1. Who We Are',
              content: `JIMAT is an AI-powered electricity bill intelligence service operated by AWAS Premium Resources (SSM Registration No. 202603141446), based in Malaysia. We are committed to protecting your personal data in accordance with the Personal Data Protection Act 2010 (PDPA) of Malaysia.

Contact us at: hello@awas.asia`
            },
            {
              title: '2. What Data We Collect',
              content: `When you register and use JIMAT, we collect:

- Full name and email address
- Phone number (optional)
- Location data (postcode, township, state)
- Housing type and appliance profile
- TNB bill data extracted via OCR (billing month, kWh usage, charges)
- Payment transaction references (via ToyyibPay)

We do NOT collect or store:
- Your TNB bill images or PDF files — these are read by AI and immediately discarded
- Your TNB account number or login credentials
- Your bank account or card details — all payments are processed by ToyyibPay`
            },
            {
              title: '3. How We Use Your Data',
              content: `We use your data solely to:

- Generate your personalised electricity bill analysis and savings report
- Track your billing history to provide month-on-month comparison
- Process your payments securely via ToyyibPay
- Send you transactional emails related to your account
- Improve our AI analysis engine (anonymised, aggregate data only)

We do NOT sell, rent, or share your personal data with third parties for marketing purposes.`
            },
            {
              title: '4. AI Processing of Your Bill',
              content: `JIMAT uses Claude AI (Anthropic) to read and extract data from your uploaded TNB bill. This processing is:

- Immediate — the bill image or PDF is processed in real-time
- Stateless — no bill image is stored on our servers or Anthropic's servers after processing
- Secure — data is transmitted via encrypted HTTPS connections

The extracted data (billing month, kWh, charges) is stored in your account to power your analysis. The original bill file is never retained.`
            },
            {
              title: '5. Data Storage and Security',
              content: `Your data is stored on:

- Neon PostgreSQL — a secure cloud database hosted in the United States
- Render.com — our backend server infrastructure

We implement industry-standard security measures including:
- Encrypted data transmission (HTTPS/TLS)
- Bcrypt password hashing
- JWT-based authentication with expiry
- No plaintext storage of sensitive data

While we take reasonable precautions, no internet transmission is 100% secure. You use JIMAT at your own risk.`
            },
            {
              title: '6. Data Retention',
              content: `We retain your personal data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.

Your billing analysis history is retained to provide month-on-month comparison — a core feature of JIMAT. You may request deletion of specific records by contacting us.`
            },
            {
              title: '7. Your Rights Under PDPA',
              content: `Under the Personal Data Protection Act 2010 (Malaysia), you have the right to:

- Access the personal data we hold about you
- Correct inaccurate or incomplete data
- Withdraw consent for data processing
- Request deletion of your personal data
- Lodge a complaint with the Department of Personal Data Protection Malaysia

To exercise any of these rights, contact us at hello@awas.asia. We will respond within 14 working days.`
            },
            {
              title: '8. Cookies and Local Storage',
              content: `JIMAT uses:

- Cookies — to maintain your login session (JWT token, expires in 30 days)
- Browser localStorage — to remember your language preference (EN/BM)

We do not use tracking cookies or third-party advertising cookies.`
            },
            {
              title: '9. Third Party Services',
              content: `JIMAT integrates with the following third-party services:

- ToyyibPay — payment processing. Their privacy policy applies to payment data.
- Anthropic Claude — AI bill reading. No bill data is retained by Anthropic after processing.
- Neon Database — data storage.
- Vercel / Render — hosting infrastructure.
- Resend — transactional email delivery.

We are not responsible for the privacy practices of these third-party providers.`
            },
            {
              title: '10. Changes to This Policy',
              content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of JIMAT after changes constitutes acceptance of the updated policy.`
            },
            {
              title: '11. Contact Us',
              content: `For any privacy-related queries or requests:

AWAS Premium Resources
SSM Registration: 202603141446
Email: hello@awas.asia
Platform: jimat.info`
            }
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-bold text-white mb-3"
                style={{ borderLeft: '3px solid #FACC15', paddingLeft: '12px' }}>
                {section.title}
              </h2>
              <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            JIMAT by AWAS Premium Resources · SSM 202603141446 · hello@awas.asia
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/terms" className="text-xs transition-colors" style={{ color: 'rgba(250,204,21,0.5)' }}>
              Terms of Service
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            <Link href="/login" className="text-xs transition-colors" style={{ color: 'rgba(250,204,21,0.5)' }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
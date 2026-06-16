'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Last updated: June 2026 · AWAS Premium Resources (SSM 202603141446)
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              content: `By registering for or using JIMAT ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use JIMAT.

JIMAT is operated by AWAS Premium Resources (SSM 202603141446). These terms constitute a legally binding agreement between you and AWAS Premium Resources.`
            },
            {
              title: '2. Description of Service',
              content: `JIMAT is an AI-powered electricity bill intelligence platform that:

- Reads your TNB (Tenaga Nasional Berhad) electricity bill using AI OCR technology
- Analyses your declared home appliance profile
- Generates a personalised report identifying your highest energy-consuming appliances
- Provides actionable monthly saving missions
- Tracks your month-on-month bill progress

JIMAT is a Pay-As-You-Go (PAYG) service. There is no recurring subscription. Each analysis is a separate transaction.`
            },
            {
              title: '3. Pricing and Payments',
              content: `JIMAT operates on a Pay-As-You-Go model:

New User / Chain Reset: RM11.99 (Household) or RM29.99 (Institutional) + RM1.00 gateway fee
Returning User (consecutive month): RM6.99 (Household) or RM14.99 (Institutional) + RM1.00 gateway fee

The RM1.00 gateway fee is charged by ToyyibPay and is non-refundable.

All payments are processed by ToyyibPay. By making a payment, you agree to ToyyibPay's terms and conditions. AWAS Premium Resources does not store your payment card details.

Payments are non-refundable once your report has been generated and unlocked.`
            },
            {
              title: '4. Bill Chain Policy',
              content: `JIMAT's analysis system requires consecutive monthly bill uploads to generate comparative insights:

- New users must upload 2 consecutive months of TNB bills to establish a baseline
- Returning users who upload within the same billing cycle qualify for the reduced rate
- Users who lapse for more than one billing cycle must re-upload 2 consecutive bills and pay the standard rate

The "chain" status is determined by the billing months extracted from your uploaded bills. JIMAT is not responsible for incorrect billing month detection if the bill is unclear or damaged.`
            },
            {
              title: '5. Accuracy Disclaimer',
              content: `JIMAT provides estimates and analysis based on:

- Data extracted from your uploaded TNB bill via AI OCR
- Your declared appliance profile (type, age, usage hours)
- TNB's published tariff rates (effective July 2025)
- The declared Automatic Fuel Adjustment (AFA) rate

IMPORTANT: JIMAT's analysis is an ESTIMATE. Actual savings may vary depending on:
- Real-world appliance usage patterns
- Changes in TNB tariff structure
- Seasonal variations in consumption
- Accuracy of your declared appliance profile

AWAS Premium Resources does not guarantee specific bill reductions. The analysis is provided for informational and educational purposes only.`
            },
            {
              title: '6. User Responsibilities',
              content: `By using JIMAT, you agree to:

- Provide accurate information about your appliances and usage patterns
- Upload only your own TNB bills or bills you are authorised to process
- Not attempt to manipulate, hack, or reverse-engineer the JIMAT platform
- Not use JIMAT for any unlawful purpose
- Keep your account credentials confidential

You are responsible for the accuracy of the appliance data you declare. Inaccurate declarations will result in less accurate analysis.`
            },
            {
              title: '7. Intellectual Property',
              content: `All content, features, algorithms, and technology within JIMAT are the intellectual property of AWAS Premium Resources. This includes but is not limited to:

- The TNB tariff calculation engine
- The appliance bleeder detection algorithm
- The monthly mission generation system
- The JIMAT brand, logo, and visual identity

You may not copy, reproduce, distribute, or create derivative works from any part of JIMAT without written permission from AWAS Premium Resources.`
            },
            {
              title: '8. Limitation of Liability',
              content: `To the maximum extent permitted by Malaysian law, AWAS Premium Resources shall not be liable for:

- Any indirect, incidental, or consequential damages arising from use of JIMAT
- Inaccuracies in the AI-generated analysis
- Financial decisions made based on JIMAT's recommendations
- Loss of data due to technical failures
- Service interruptions or downtime

Your use of JIMAT is at your own risk. The Service is provided "as is" without warranties of any kind.`
            },
            {
              title: '9. Service Availability',
              content: `JIMAT is provided on a best-effort basis. We do not guarantee:

- 100% uptime or availability
- Uninterrupted access to the service
- That the service will be error-free

We reserve the right to suspend or terminate the service for maintenance, upgrades, or any reason, with or without notice.`
            },
            {
              title: '10. Account Termination',
              content: `We reserve the right to suspend or terminate your account if you:

- Violate these Terms of Service
- Provide false or misleading information
- Attempt to abuse or exploit the JIMAT platform
- Fail to pay for services rendered

You may delete your account at any time by contacting hello@awas.asia.`
            },
            {
              title: '11. Governing Law',
              content: `These Terms of Service are governed by the laws of Malaysia. Any disputes arising from the use of JIMAT shall be subject to the exclusive jurisdiction of the courts of Malaysia.`
            },
            {
              title: '12. Changes to Terms',
              content: `We reserve the right to update these Terms of Service at any time. We will notify users of material changes via email or in-app notification. Continued use of JIMAT after changes constitutes acceptance of the updated terms.`
            },
            {
              title: '13. Contact',
              content: `For any questions regarding these Terms of Service:

AWAS Premium Resources
SSM Registration: 202603141446
Email: hello@awas.asia
Platform: jimat-frontend.vercel.app`
            }
          ].map((section, i) => (
            <div key={i}>
              <h2 className="text-base font-bold text-white mb-3"
                style={{ borderLeft: '3px solid #FACC15', paddingLeft: '12px' }}>
                {section.title}
              </h2>
              <p className="text-sm whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8' }}>
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
            <Link href="/privacy" className="text-xs" style={{ color: 'rgba(250,204,21,0.5)' }}>
              Privacy Policy
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            <Link href="/login" className="text-xs" style={{ color: 'rgba(250,204,21,0.5)' }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
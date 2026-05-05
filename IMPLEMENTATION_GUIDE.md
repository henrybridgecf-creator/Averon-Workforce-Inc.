# AverPay Account Verification Implementation Guide

This guide details the integration of **Brevo (formerly Sendinblue)** for automated email verification and overall platform stabilization.

## 1. Environment Configuration
Add the following variables to your environment tracking (e.g., `.env` or AI Studio settings):

```env
# Brevo (formerly Sendinblue) API Key
BREVO_API_KEY=your_at_brevo_api_key

# Sender Configuration
BREVO_SENDER_EMAIL=notifications@averpay.io
BREVO_SENDER_NAME=AverPay Security
```

## 2. Integrated Components

### A. Email Service (`/src/lib/email.ts`)
- **Provider:** Switched to Brevo v3 API.
- **Reliability:** Added a `MAX_RETRIES` (3) mechanism with exponential backoff.
- **Safety:** Implemented `AbortController` timeouts (10s) to prevent hanging requests and memory leaks.
- **Compliance:** Used `fetch` instead of heavy SDKs to keep the bundle light and avoid browser-side initialization crashes.

### B. Verification Flow
1. **Signup Update (`/src/app/signup/page.tsx`):**
   - Generates a secure token using `requestEmailVerification`.
   - Transmits a branded template instead of plain text.
   - Replaces immediate redirect with a tactical "Success" state to prompt inbox checking.
2. **Verification Handler (`/src/app/verify-email/page.tsx`):**
   - Extracts tokens from query parameters.
   - Validates against the registry.
   - Provides a high-fidelity feedback UI with success/error states.

### C. Registry Stabilization (`/src/lib/mock-data.ts`)
- **Normalization:** Added logic to ensure numbers and nested objects (bank details) are always initialized, preventing "Cannot read property of undefined" crashes.
- **Initialization:** Optimized `initializeUsers` with a `dataInitialized` flag to prevent redundant processing cycles.

## 3. Testing Instructions
1. **Local Sandbox:** Ensure you have added the `BREVO_API_KEY`.
2. **Signup:** Navigate to `/signup`, fill the form, and verify the "Transmission Sent" screen appears.
3. **Email Check:** (If API Key is set) Check your inbox for the AverPay branded email.
4. **Action:** Click the button. It should open your dev URL with the `?token=...` parameter.
5. **Success:** The verification page should show "Establish Neural Link" success and provide a path to Login.

## 4. Crash Prevention Diagnosis
- **API Loops:** Identified and guarded storage event listeners to prevent recursive state updates.
- **Memory Overload:** Added timeouts to external fetch requests.
- **Infinite Rendering:** Verified `useEffect` dependency arrays in high-traffic pages (Dashboard, Signup) are stable.
- **Async Handling:** Ensured all network-dependent logic uses `try/catch` with fallback states to keep the UI interactive even during failures.

## 5. Metadata Update
The platform name has been unified as **AverPay** across all security-critical screens.

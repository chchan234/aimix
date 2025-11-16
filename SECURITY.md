# Security Documentation

## Overview

This document outlines the security measures implemented in the AI Platform and known security considerations.

## Implemented Security Measures

### 1. JWT Secret Validation ✅

**Issue**: Default JWT secret could allow token forgery
**Solution**: Server validates JWT_SECRET on startup
- Requires JWT_SECRET environment variable
- Rejects default value 'your-secret-key-change-this'
- Requires minimum 32 characters length
- Server refuses to start if validation fails

**Location**: `server/src/index.ts:10-42`

### 2. Password Policy ✅

**Issue**: Client-server password policy mismatch
**Solution**: Aligned password requirements
- Minimum 8 characters (both client and server)
- Server-side validation prevents API bypass
- Client-side validation for UX

**Location**:
- Server: `server/src/routes/auth.ts:34-38`
- Client: `client/src/pages/SignupPage.tsx:33-36`

### 3. OAuth CSRF Protection ✅

**Issue**: Kakao OAuth vulnerable to login CSRF attacks
**Solution**: State parameter implementation
- Generate random 256-bit state on login initiation
- Store state in sessionStorage
- Verify state matches on callback
- Prevents attacker from binding user to their account

**Location**:
- State generation: `client/src/services/auth.ts:146-167`
- State verification: `client/src/pages/KakaoCallback.tsx:30-32`

### 4. AI Endpoint Protection ✅

**Issue**: Unauthenticated access to AI APIs causing cost abuse
**Solution**: Multi-layer protection
- **Authentication**: JWT token required for all AI endpoints
- **Rate Limiting**: 30 requests per minute per user
- **Credit System**: Each service costs credits
  - name-analysis: 10 credits
  - dream-interpretation: 15 credits
  - story: 20 credits
  - chat: 5 credits
  - face-reading: 25 credits

**Location**:
- Auth middleware: `server/src/middleware/auth.ts`
- Rate limiting: `server/src/middleware/rateLimit.ts`
- Credit system: `server/src/middleware/credits.ts`
- Applied to: `server/src/routes/ai.ts:17-20`

## Known Security Considerations

### Token Storage in localStorage

**Current Implementation**: JWT tokens stored in localStorage
**Security Risk**: Vulnerable to XSS attacks

#### Why localStorage?

1. **SPA Architecture**: Single-page application with client-side routing
2. **Cross-domain**: Frontend and backend on different domains
3. **Simplicity**: No server-side session management needed

#### Risk Mitigation

1. **Content Security Policy**: Implement CSP headers to prevent XSS
2. **Input Sanitization**: All user inputs sanitized to prevent script injection
3. **HTTPS Only**: All traffic encrypted in transit
4. **Token Expiration**: Tokens expire after 7 days

#### Future Improvements

**Option 1: httpOnly Cookies** (Recommended for production)
- Store JWT in httpOnly cookie
- Prevents JavaScript access (XSS protection)
- Requires same-domain deployment or CORS credentials
- Needs CSRF protection (already implemented with state parameter)

**Option 2: Memory + Refresh Token Pattern**
- Store access token in memory (lost on refresh)
- Store refresh token in httpOnly cookie
- Automatically refresh on app load
- Best of both worlds but more complex

**Implementation Priority**: Medium (current risk is acceptable with proper XSS prevention)

### Email Verification

**Current Behavior**: JWT issued before email verification
**Security Impact**: Low

Users can register and receive JWT before email verification, but:
- Email verification status included in JWT payload
- Critical features can require `emailVerified: true`
- OAuth users (Kakao) don't need email verification

**Future Enhancement**: Add `requireEmailVerification` middleware to critical endpoints

### Rate Limiting Storage

**Current Implementation**: In-memory rate limiting
**Production Concern**: Won't work across multiple server instances

**Solution for Production**:
- Use Redis for distributed rate limiting
- Implement using `express-rate-limit` with Redis store
- Share rate limit state across all server instances

## Environment Variables

Required environment variables for security:

```bash
# Critical - Server won't start without these
JWT_SECRET=<strong-random-string-min-32-chars>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>

# AI Services (required for AI endpoints)
GEMINI_API_KEY=<your-gemini-api-key>
OPENAI_API_KEY=<your-openai-api-key>

# Email (required for email verification)
SENDGRID_API_KEY=<your-sendgrid-api-key>
SENDGRID_FROM_EMAIL=<verified-sender-email>

# OAuth (required for Kakao login)
KAKAO_REST_API_KEY=<your-kakao-rest-api-key>

# Client URL (for CORS)
CLIENT_URL=https://aiports.org
```

### Generating Secure JWT_SECRET

```bash
# Generate a secure random string (Unix/Mac)
openssl rand -base64 48

# Generate a secure random string (Node.js)
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Security Checklist

### Production Deployment

- [ ] Set strong JWT_SECRET (min 32 chars, random)
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Set up Redis for rate limiting
- [ ] Enable CORS with specific origins only
- [ ] Implement request logging and monitoring
- [ ] Set up error alerting for security events
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement backup and recovery procedures

### Code Security

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Supabase parameterized queries)
- [ ] XSS prevention (React auto-escapes by default)
- [ ] CSRF protection (state parameter in OAuth)
- [ ] Rate limiting on all endpoints
- [ ] Authentication on protected endpoints
- [ ] Proper error handling (no sensitive data in errors)

## Reporting Security Issues

If you discover a security vulnerability, please email: [security@aiports.org]

**Do not** create public GitHub issues for security vulnerabilities.

## Security Update Log

| Date | Update | Impact |
|------|--------|--------|
| 2025-01-16 | Added JWT secret validation | Critical - Prevents token forgery |
| 2025-01-16 | Aligned password policy | Medium - Prevents weak passwords |
| 2025-01-16 | Added OAuth state parameter | High - Prevents CSRF attacks |
| 2025-01-16 | Added AI endpoint authentication | Critical - Prevents cost abuse |
| 2025-01-16 | Added rate limiting | High - Prevents DoS and abuse |
| 2025-01-16 | Added credit system | Critical - Prevents unlimited API usage |

---

**Last Updated**: 2025-01-16
**Security Review Needed**: Every 3 months

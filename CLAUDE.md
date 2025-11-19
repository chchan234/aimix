# AI PORT Project Guidelines

## Service Page Requirements

### Authentication State Monitoring (Required for ALL service pages)

Every service page in `client/src/pages/services/` MUST include auth state monitoring to prevent unauthorized access after logout.

**Required imports:**
```tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { isLoggedIn } from '../../services/auth';
```

**Required state:**
```tsx
const [, setLocation] = useLocation();
```

**Required useEffect (add after other useEffects):**
```tsx
// Auth state monitoring - redirect if logged out
useEffect(() => {
  const checkAuth = () => {
    if (!isLoggedIn()) {
      setLocation('/login');
    }
  };

  window.addEventListener('focus', checkAuth);
  window.addEventListener('storage', checkAuth);

  return () => {
    window.removeEventListener('focus', checkAuth);
    window.removeEventListener('storage', checkAuth);
  };
}, [setLocation]);
```

This ensures:
- User is redirected to login when returning to the tab after logging out
- User is redirected when logging out from another tab (storage event)

### Service Page Button Login Check

In addition to auth monitoring, the "시작하기" (Start) button should also check login:

```tsx
const handleStart = () => {
  if (!isLoggedIn()) {
    alert('로그인이 필요합니다.');
    setLocation('/login');
    return;
  }
  // ... proceed with service
};
```

## Branding

- Service name: **AI PORT**
- Do not use "AI Platform" or "AIMIX"

## Theme

- Default theme: **Light mode**
- User preference saved in localStorage

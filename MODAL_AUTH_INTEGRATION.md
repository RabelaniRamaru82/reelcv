# ReelCV Modal Authentication Integration Guide

## 🎯 Objective
Migrate ReelCV from navigation-based authentication to the new modal-based authentication system for improved UX and security.

## 📋 Prerequisites
- ✅ Modal authentication system implemented (packages/auth and packages/ui)
- ✅ Security enhancements deployed (CSRF protection, session hardening)
- ✅ Home app successfully migrated (reference implementation)

## 🔧 Integration Steps

### Step 1: Update Package Dependencies

Add the modal authentication packages to your `package.json`:

```json
{
  "dependencies": {
    "@reelapps/auth": "workspace:*",
    "@reelapps/ui": "workspace:*"
  }
}
```

### Step 2: Create AuthModal Components

Create ReelCV-specific authentication modal components:

#### `src/components/Auth/AuthModal.tsx`
```typescript
import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    onClose();
  };

  const handleSignup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: 'candidate' | 'recruiter'
  ) => {
    await signup(email, password, firstName, lastName, role);
    onClose();
  };

  const handlePasswordReset = async (email: string) => {
    await sendPasswordResetEmail(email);
  };

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onPasswordReset={handlePasswordReset}
      isLoading={isLoading}
      error={error}
      className={styles.reelCvModal}
      title="Access ReelCV"
      subtitle="Showcase your skills through video"
    />
  );
};
```

#### `src/components/Auth/AuthModal.module.css`
```css
.reelCvModal {
  --modal-accent-color: #10b981; /* ReelCV brand green */
  --modal-accent-hover: #059669;
}

.reelCvModal .modal-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.reelCvModal .modal-title {
  color: white;
}

.reelCvModal .modal-subtitle {
  color: rgba(255, 255, 255, 0.9);
}

.reelCvModal .primary-button {
  background: var(--modal-accent-color);
  border-color: var(--modal-accent-color);
}

.reelCvModal .primary-button:hover {
  background: var(--modal-accent-hover);
  border-color: var(--modal-accent-hover);
}
```

### Step 3: Create AuthWrapper Component

#### `src/components/Auth/AuthWrapper.tsx`
```typescript
import React from 'react';
import { AppWrapper } from '@reelapps/ui';
import { AuthModal } from './AuthModal';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <AppWrapper
      renderAuthModal={(isOpen, onClose) => (
        <AuthModal isOpen={isOpen} onClose={onClose} />
      )}
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ReelCV...</p>
          </div>
        </div>
      }
    >
      {children}
    </AppWrapper>
  );
};
```

### Step 4: Update Main App Component

#### `src/App.tsx` (Updated)
```typescript
import React from 'react';
import { AuthWrapper } from './components/Auth/AuthWrapper';
import { CandidateDashboard } from './CandidateDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <CandidateDashboard />
      </div>
    </AuthWrapper>
  );
};

export default App;
```

### Step 5: Update CandidateDashboard for Authentication

#### `src/CandidateDashboard.tsx` (Updated)
```typescript
import React, { useEffect } from 'react';
import { useAuthStore } from '@reelapps/auth';
import styles from './CandidateDashboard.module.css';

export const CandidateDashboard: React.FC = () => {
  const { user, profile, logout, refreshProfile } = useAuthStore();

  useEffect(() => {
    // Refresh profile when component mounts
    if (user && !profile) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    // This shouldn't happen due to AuthWrapper, but good fallback
    return <div>Please log in to access ReelCV</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>ReelCV Dashboard</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {profile?.first_name || user.email}</span>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <h2>Your Video CV Portfolio</h2>
          <p>Showcase your skills and experience through video.</p>
          
          {/* Your existing ReelCV content here */}
          <div className={styles.videoGrid}>
            {/* Video CV components */}
          </div>
        </div>
      </main>
    </div>
  );
};
```

### Step 6: Update Styling

#### `src/CandidateDashboard.module.css` (Updated)
```css
.dashboard {
  min-height: 100vh;
  background: #f9fafb;
}

.header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.headerContent {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.userInfo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logoutButton {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logoutButton:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.videoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

## 🔒 Security Considerations

### 1. CSRF Protection
The modal authentication system automatically includes CSRF protection. No additional configuration needed.

### 2. Session Security
Enhanced session validation is automatically enabled. Monitor the console for any security warnings.

### 3. Role-Based Access
ReelCV is primarily candidate-focused. Consider role validation:

```typescript
const { user, profile } = useAuthStore();

// Role-based content rendering
if (profile?.role !== 'candidate') {
  return (
    <div className="text-center p-8">
      <h2>Access Restricted</h2>
      <p>ReelCV is designed for candidates. Please use ReelHunter for recruiting.</p>
    </div>
  );
}
```

## 🧪 Testing the Integration

### 1. Authentication Flow Testing
- [ ] Modal opens when user is not authenticated
- [ ] Login redirects to dashboard after success
- [ ] Signup creates account and shows dashboard
- [ ] Password reset shows success message
- [ ] Logout clears session and shows modal

### 2. Security Testing
- [ ] CSRF tokens are generated and validated
- [ ] Session security validation works
- [ ] User enumeration protection is active
- [ ] Audit logging is functioning

### 3. User Experience Testing
- [ ] Modal is accessible (keyboard navigation, screen readers)
- [ ] Deep links are preserved during authentication
- [ ] Loading states are smooth
- [ ] Error handling is user-friendly

## 🚀 Deployment Checklist

- [ ] Dependencies installed and building successfully
- [ ] AuthModal components created and styled
- [ ] AuthWrapper integrated into main App
- [ ] CandidateDashboard updated for new auth flow
- [ ] Security features tested and verified
- [ ] User acceptance testing completed
- [ ] Performance impact assessed
- [ ] Rollback plan prepared

## 🔧 Troubleshooting

### Common Issues:

1. **Modal not showing**: Check that AuthWrapper is at the root level
2. **Auth state not syncing**: Verify @reelapps/auth package is installed
3. **Styling conflicts**: Ensure CSS modules are properly configured
4. **TypeScript errors**: Update tsconfig.json to include required types

### Debug Mode:
Add this to check auth state:
```typescript
console.log('Auth Debug:', {
  user: useAuthStore(state => state.user),
  isAuthenticated: useAuthStore(state => state.isAuthenticated),
  isLoading: useAuthStore(state => state.isLoading)
});
```

## 📞 Support
For integration issues, check the main implementation status doc or refer to the Home app implementation as a reference. 
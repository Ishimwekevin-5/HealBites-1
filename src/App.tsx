/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading, isSigningIn, signIn, logout, isAdmin } = useAuth();
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-sans font-bold uppercase tracking-widest text-xs">Preparing your healthy menu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={signIn} isSigningIn={isSigningIn} />;
  }

  if (view === 'admin' && isAdmin) {
    return <AdminDashboard onBack={() => setView('dashboard')} />;
  }

  return (
    <Dashboard 
      user={user} 
      onSignOut={logout} 
      isAdmin={isAdmin} 
      onOpenAdmin={() => setView('admin')} 
    />
  );
}


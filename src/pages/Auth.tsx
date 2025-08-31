
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SimpleAuthModal from '@/components/SimpleAuthModal';

export default function Auth() {
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Autenticación | SavorySearch</title>
        <meta name="description" content="Inicia sesión o regístrate en SavorySearch" />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-glass shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">SavorySearch</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Inicia sesión para continuar
            </p>
          </CardHeader>

          <CardContent>
            <SimpleAuthModal open={true} onOpenChange={() => {}} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Steps, Card, Typography, Spin } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import OrganizationStep from './components/OrganizationStep';
import TeamStep from './components/TeamStep';
import InviteStep from './components/InviteStep';
import CompleteStep from './components/CompleteStep';

const { Title, Text } = Typography;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  const hasCompletedOnboarding = useOrganizationStore((state) => state.hasCompletedOnboarding);
  const initializeOrganization = useOrganizationStore((state) => state.initializeOrganization);
  const isOrgHydrated = useOrganizationStore((state) => state.isHydrated);

  useEffect(() => {
    initializeAuth();
    initializeOrganization();
  }, [initializeAuth, initializeOrganization]);

  useEffect(() => {
    if (isHydrated && isOrgHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (hasCompletedOnboarding) {
        router.push('/dashboard');
        return;
      }

      setIsLoading(false);
    }
  }, [isAuthenticated, isHydrated, isOrgHydrated, hasCompletedOnboarding, router]);

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const handleSkipToComplete = () => {
    setCurrentStep(3);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const steps = [
    { title: 'Organization', description: 'Set up your company' },
    { title: 'Teams', description: 'Create teams (optional)' },
    { title: 'Invite', description: 'Invite members (optional)' },
    { title: 'Complete', description: 'You\'re all set!' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <OrganizationStep onNext={handleNext} />;
      case 1:
        return <TeamStep onNext={handleNext} onBack={handleBack} onSkip={handleSkipToComplete} />;
      case 2:
        return <InviteStep onNext={handleNext} onBack={handleBack} onSkip={handleSkipToComplete} />;
      case 3:
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#fff',
              color: '#667eea',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
            }}
          >
            In
          </div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            Welcome to Influmo CRM
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
            Let&apos;s get your workspace set up in just a few steps
          </Text>
        </div>

        {/* Steps Indicator */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          }}
          bodyStyle={{ padding: '24px 32px' }}
        >
          <Steps
            current={currentStep}
            items={steps.map((step) => ({
              title: step.title,
              description: step.description,
            }))}
            size="small"
          />
        </Card>

        {/* Step Content */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
          }}
          bodyStyle={{ padding: '32px 40px' }}
        >
          {renderStep()}
        </Card>
      </div>
    </div>
  );
}


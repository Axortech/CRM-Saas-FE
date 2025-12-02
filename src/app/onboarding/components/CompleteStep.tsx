'use client';

import React from 'react';
import { Button, Typography, Result } from 'antd';
import { CheckCircleFilled, RocketOutlined } from '@ant-design/icons';
import { useOrganizationStore } from '@/store/organizationStore';

const { Title, Text, Paragraph } = Typography;

interface CompleteStepProps {
  onComplete: () => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  const currentOrg = useOrganizationStore((state) => state.currentOrganization);

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div
        style={{
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <CheckCircleFilled style={{ fontSize: 40, color: '#fff' }} />
      </div>

      <Title level={3} style={{ marginBottom: 8 }}>
        You&apos;re All Set!
      </Title>

      <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 400, margin: '0 auto 32px' }}>
        <strong>{currentOrg?.name}</strong> is ready to go. Start managing your contacts,
        leads, and grow your business.
      </Paragraph>

      <div
        style={{
          background: '#f5f5f5',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          textAlign: 'left',
        }}
      >
        <Text strong style={{ marginBottom: 16, display: 'block' }}>
          Here&apos;s what you can do next:
        </Text>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#595959' }}>
          <li style={{ marginBottom: 8 }}>Import your existing contacts</li>
          <li style={{ marginBottom: 8 }}>Create leads and track opportunities</li>
          <li style={{ marginBottom: 8 }}>Set up custom fields for your workflow</li>
          <li style={{ marginBottom: 8 }}>Invite more team members anytime</li>
        </ul>
      </div>

      <Button
        type="primary"
        size="large"
        icon={<RocketOutlined />}
        onClick={onComplete}
        style={{
          height: 52,
          paddingInline: 48,
          fontSize: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}


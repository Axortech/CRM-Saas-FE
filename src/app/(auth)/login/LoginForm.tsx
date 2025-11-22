'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/services/queries/auth';
import { LoginRequest } from '@/types/auth';
import { CRM_COLORS } from '@/config/colors';

const { Title, Text } = Typography;

export default function LoginForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [rememberMe, setRememberMe] = useState(false);

  const onFinish = async (values: LoginRequest) => {
    try {
      await loginMutation.mutateAsync(values);
      message.success('Login successful!');
      
      // Small delay to ensure Zustand store is fully updated before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.email) {
        message.error(errorData.email[0]);
      } else if (errorData?.password) {
        message.error(errorData.password[0]);
      } else if (errorData?.detail) {
        message.error(errorData.detail);
      } else if (errorData?.non_field_errors) {
        message.error(errorData.non_field_errors[0]);
      }
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8, color: CRM_COLORS.primary }}>
            CRM Pro
          </Title>
          <Text type="secondary">Welcome back to your CRM</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loginMutation.isLoading}
            block
            size="large"
            style={{ marginBottom: 16 }}
          >
            Sign In
          </Button>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: CRM_COLORS.primary, fontWeight: 600 }}>
              Sign Up
            </Link>
          </Text>
        </div>
      </Space>
    </Card>
  );
}
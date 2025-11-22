'use client';

import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/services/queries/auth';
import { RegisterRequest } from '@/types/auth';
import { CRM_COLORS } from '@/config/colors';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const [form] = Form.useForm();
  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const onFinish = async (values: RegisterRequest) => {
    try {
      await registerMutation.mutateAsync(values);
      message.success('Registration successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.email) {
        message.error(errorData.email[0]);
      } else if (errorData?.password) {
        message.error(errorData.password[0]);
      } else if (errorData?.detail) {
        message.error(errorData.detail);
      }
    }
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 480,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 8, color: CRM_COLORS.primary }}>
            CRM Pro
          </Title>
          <Text type="secondary">Create your account to get started</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="First name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Last name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Invalid email format' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password_confirm"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={registerMutation.isLoading}
            block
            size="large"
            style={{ marginBottom: 16 }}
          >
            Create Account
          </Button>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Already have an account?{' '}
            <Link href="/login" style={{ color: CRM_COLORS.primary, fontWeight: 600 }}>
              Sign In
            </Link>
          </Text>
        </div>
      </Space>
    </Card>
  );
}
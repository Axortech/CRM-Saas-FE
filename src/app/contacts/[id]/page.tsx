'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Tabs,
  Avatar,
  Divider,
  Empty,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  UserOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  useContactQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from '@/services/queries/contacts';
import ContactForm from '@/components/crm/ContactForm';
import { CreateContactRequest } from '@/types/crm';

const { Title, Text, Paragraph } = Typography;

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);

  const { data: contact, isLoading, refetch } = useContactQuery(contactId);
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();

  const handleUpdate = async (values: CreateContactRequest) => {
    try {
      await updateContactMutation.mutateAsync({ id: contactId, ...values });
      message.success('Contact updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (error) {
      message.error('Failed to update contact');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure you want to delete this contact? This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteContactMutation.mutateAsync(contactId);
          message.success('Contact deleted');
          router.push('/contacts');
        } catch (error) {
          message.error('Failed to delete contact');
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="Contact not found" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={() => router.push('/contacts')}>Back to Contacts</Button>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Email">
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              {contact.mobile ? <a href={`tel:${contact.mobile}`}>{contact.mobile}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Company">{contact.company || '-'}</Descriptions.Item>
            <Descriptions.Item label="Job Title">{contact.job_title || '-'}</Descriptions.Item>
            <Descriptions.Item label="Department">{contact.department || '-'}</Descriptions.Item>
            <Descriptions.Item label="Website" span={2}>
              {contact.website ? (
                <a href={contact.website} target="_blank" rel="noopener noreferrer">
                  {contact.website}
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {contact.address ? (
                <>
                  {contact.address.street && <div>{contact.address.street}</div>}
                  {(contact.address.city || contact.address.state || contact.address.postal_code) && (
                    <div>
                      {[contact.address.city, contact.address.state, contact.address.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  {contact.address.country && <div>{contact.address.country}</div>}
                </>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Source">{contact.source || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={contact.status === 'active' ? 'green' : 'default'}>
                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tags" span={2}>
              {contact.tags.length > 0 ? (
                <Space wrap>
                  {contact.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {contact.notes || '-'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Descriptions column={2} size="small" title="System Information">
            <Descriptions.Item label="Created By">{contact.created_by_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(contact.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(contact.updated_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned To">{contact.assigned_to_name || 'Unassigned'}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'activity',
      label: 'Activity',
      children: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No activity yet"
          style={{ padding: '40px 0' }}
        />
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      children: (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No notes yet"
          style={{ padding: '40px 0' }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Back Button */}
      <div style={{ marginBottom: 24 }}>
        <a
          onClick={() => router.push('/contacts')}
          style={{ color: '#1677ff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeftOutlined /> Back to Contacts
        </a>
      </div>

      {isEditing ? (
        <Card>
          <Title level={4} style={{ marginBottom: 24 }}>
            Edit Contact
          </Title>
          <ContactForm
            initialValues={contact}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={updateContactMutation.isLoading}
          />
        </Card>
      ) : (
        <>
          {/* Header Card */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Space size={16}>
                <Avatar
                  size={72}
                  src={contact.avatar_url}
                  style={{ backgroundColor: !contact.avatar_url ? '#1677ff' : undefined }}
                >
                  {!contact.avatar_url && `${contact.first_name?.charAt(0)}${contact.last_name?.charAt(0)}`}
                </Avatar>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {contact.first_name} {contact.last_name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    {contact.job_title} {contact.company && `at ${contact.company}`}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Space>
                      <Tag color={contact.status === 'active' ? 'green' : 'default'}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </Tag>
                      {contact.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </Space>
              <Space>
                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                  Delete
                </Button>
              </Space>
            </div>

            <Divider />

            {/* Quick Actions */}
            <Space size={24}>
              <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MailOutlined /> {contact.email}
              </a>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PhoneOutlined /> {contact.phone}
                </a>
              )}
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <GlobalOutlined /> Website
                </a>
              )}
            </Space>
          </Card>

          {/* Tabs */}
          <Card>
            <Tabs items={tabItems} />
          </Card>
        </>
      )}
    </div>
  );
}


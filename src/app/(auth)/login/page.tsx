import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' 
    }}>
      <LoginForm />
    </div>
  );
}
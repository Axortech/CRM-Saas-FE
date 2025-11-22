import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' 
    }}>
      <RegisterForm />
    </div>
  );
}
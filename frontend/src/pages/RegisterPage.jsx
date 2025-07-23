import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // signUp fonksiyonunu güncellemen gerekirse burada firstName ve lastName'i de ekle
      await signUp(form.email, form.password, form.firstName, form.lastName);
      alert('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Kayıt Ol
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ad"
            type="text"
            fullWidth
            margin="normal"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <TextField
            label="Soyad"
            type="text"
            fullWidth
            margin="normal"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <TextField
            label="E-posta"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <TextField
            label="Şifre"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Kayıt Ol
          </Button>
        </form>
        <Button onClick={() => navigate('/login')} fullWidth sx={{ mt: 1 }}>
          Zaten hesabın var mı? Giriş Yap
        </Button>
      </Box>
    </Container>
  );
} 
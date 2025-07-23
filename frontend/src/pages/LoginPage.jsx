import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(form.email, form.password);
      // Yönlendirme useEffect ile yapılacak
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Giriş Yap
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
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
            Giriş Yap
          </Button>
        </form>
        <Button onClick={() => navigate('/register')} fullWidth sx={{ mt: 1 }}>
          Hesabın yok mu? Kayıt Ol
        </Button>
        <p>Aktif kullanıcı: {user ? user.email : "Yok"}</p>
      </Box>
    </Container>
  );
} 
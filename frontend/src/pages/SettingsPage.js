import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Container, Typography, Box } from '@mui/material';
import { supabase } from '../services/supabaseClient';

export default function SettingsPage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser) return;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();
      if (!error && data) setProfile(data);
    }
    fetchProfile();
  }, [authUser]);

  if (!authUser || !profile) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Profil Bilgilerim
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1"><strong>Ad:</strong> {profile.first_name}</Typography>
        <Typography variant="subtitle1"><strong>Soyad:</strong> {profile.last_name}</Typography>
        <Typography variant="subtitle1"><strong>Email:</strong> {profile.email}</Typography>
        <Typography variant="subtitle1"><strong>Rol:</strong> {profile.role}</Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={logout}>
        Çıkış Yap
      </Button>
    </Container>
  );
} 
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Card, CardContent, Divider, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getMe, updateMe, deleteMe } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getMe().then(data => {
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    });
  }, []);
  
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const updatedUser = await updateMe(form);
      setUser(updatedUser); // Update user in context
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      try {
        await deleteMe();
        logout();
        navigate('/login');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not delete account.');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Settings
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

      <Card component="form" onSubmit={handleUpdate} sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Update Profile</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save Changes</Button>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Account Actions</Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Log out from your account.</Typography>
            <Button variant="outlined" onClick={logout}>Logout</Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography color="error">Permanently delete your account.</Typography>
            <Button variant="contained" color="error" onClick={handleDelete}>Delete Account</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
} 
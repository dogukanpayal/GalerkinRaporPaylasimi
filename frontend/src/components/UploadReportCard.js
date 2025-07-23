import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, Input } from '@mui/material';
import { uploadReport } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

export default function UploadReportCard({ onUpload }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await uploadReport(file, notes, user.id);
      setFile(null);
      setNotes('');
      if (onUpload) onUpload();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rapor Yükle
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Input
            type="file"
            onChange={e => setFile(e.target.files[0])}
            required
          />
          <TextField
            label="Notlar"
            multiline
            minRows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Yükle'}
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
} 
import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, Input } from '@mui/material';
import { uploadReport } from '../services/api';

export default function UploadReportCard({ onUpload }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await uploadReport({ file, notes });
    setLoading(false);
    setFile(null);
    setNotes('');
    if (onUpload) onUpload();
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Report
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Input
            type="file"
            onChange={e => setFile(e.target.files[0])}
          />
          <TextField
            label="Notes"
            multiline
            minRows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Uploading...' : 'Submit'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 
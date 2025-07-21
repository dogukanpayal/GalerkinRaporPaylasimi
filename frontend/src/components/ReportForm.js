import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Input
} from '@mui/material';

export default function ReportForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;
    onSubmit({ title, description, file });
    setTitle('');
    setDescription('');
    setFile(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, boxShadow: 1, borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Submit New Report
      </Typography>
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <TextField
        label="Description"
        fullWidth
        margin="normal"
        multiline
        minRows={3}
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <Input
        type="file"
        onChange={e => setFile(e.target.files[0])}
        sx={{ mt: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </Box>
  );
} 
import React, { useState, useRef } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, Input, Paper } from '@mui/material';
import { uploadReport } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function UploadReportCard({ onUploadSuccess }) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await uploadReport(file, notes, user.id);
      setFile(null);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Card sx={{ 
      mb: 4,
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      borderRadius: 3
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600,
          color: '#1C1F2A',
          mb: 3
        }}>
          Rapor Yükle
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Dosya Yükleme Alanı */}
          <Paper
            sx={{
              p: 3,
              border: '2px dashed #E0E0E0',
              borderRadius: 2,
              backgroundColor: '#FAFAFA',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#3C8D40',
                backgroundColor: '#F8FFF8'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: '#3C8D40', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#1C1F2A', mb: 1 }}>
              Dosya Seçin
            </Typography>
            <Input
              type="file"
              inputRef={fileInputRef}
              onChange={e => setFile(e.target.files[0])}
              required
              sx={{ display: 'none' }}
            />
            {file && (
              <Typography variant="body2" sx={{ color: '#3C8D40', mt: 1, fontWeight: 500 }}>
                Seçilen: {file.name}
              </Typography>
            )}
          </Paper>

          {/* Notlar Alanı */}
          <TextField
            label="Notlar"
            multiline
            minRows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3C8D40'
                  }
                },
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3C8D40'
                  }
                }
              }
            }}
          />

          {/* Hata Mesajı */}
          {error && (
            <Typography color="error" sx={{ 
              backgroundColor: '#FFEBEE',
              p: 2,
              borderRadius: 1,
              border: '1px solid #FFCDD2'
            }}>
              {error}
            </Typography>
          )}

          {/* Yükle Butonu */}
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{
              backgroundColor: '#3C8D40',
              py: 1.5,
              px: 4,
              fontSize: '16px',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#2E7D32'
              },
              '&:disabled': {
                backgroundColor: '#BDBDBD'
              }
            }}
          >
            {loading ? 'Yükleniyor...' : 'YÜKLE'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 
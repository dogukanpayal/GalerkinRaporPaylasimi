import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link,
} from '@mui/material';
import api from '../services/api';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function ReportDetailModal({ report, onClose }) {
  if (!report) return null;

  const handleDownload = async () => {
    try {
      const response = await api.get(`/reports/download/${report.filePath}`, {
        responseType: 'blob', // Important
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.filePath);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not download the file.');
    }
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Report Details</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6">Notes:</Typography>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {report.notes || 'No notes provided.'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">File:</Typography>
          <Typography variant="body2">{report.filePath}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDownload}
          variant="contained"
          color="primary"
        >
          Download File
        </Button>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
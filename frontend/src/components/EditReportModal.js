import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

export default function EditReportModal({ report, onClose, onSave }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (report) {
      setNotes(report.notes || '');
    }
  }, [report]);

  const handleSave = () => {
    onSave(report.id, notes);
  };

  if (!report) return null;

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Report Notes</DialogTitle>
      <DialogContent dividers>
        <Box my={2}>
          <TextField
            label="Notes"
            multiline
            rows={4}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
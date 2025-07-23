import React, { useState, useMemo } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Typography, TextField, Select, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../contexts/AuthContext';
import { deleteReport, updateReport, updateReportStatus } from '../services/reportService';
import { supabase } from '../services/supabaseClient';

function DownloadLink({ filePath }) {
  const [signedUrl, setSignedUrl] = useState(null);
  React.useEffect(() => {
    let isMounted = true;
    async function fetchUrl() {
      const { data, error } = await supabase
        .storage
        .from('reports')
        .createSignedUrl(filePath, 60);
      if (isMounted && data?.signedUrl) setSignedUrl(data.signedUrl);
    }
    fetchUrl();
    return () => { isMounted = false; };
  }, [filePath]);
  if (!signedUrl) return <span>...</span>;
  return (
    <a href={signedUrl} target="_blank" rel="noopener noreferrer">
      {filePath.split('/').pop()}
    </a>
  );
}

function ReportDetailModal({ open, report, onClose }) {
  const [signedUrl, setSignedUrl] = useState(null);
  React.useEffect(() => {
    if (report?.file_path) {
      supabase.storage.from('reports').createSignedUrl(report.file_path, 60)
        .then(({ data }) => setSignedUrl(data?.signedUrl));
    }
  }, [report]);
  if (!report) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rapor Detayı</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="h6">Notlar:</Typography>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {report.notes || 'Not yok.'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6">Dosya:</Typography>
          {signedUrl ? (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer">
              {report.file_path.split('/').pop()}
            </a>
          ) : '...'}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditReportModal({ open, report, onClose, onSave }) {
  const [notes, setNotes] = useState(report?.notes || '');
  React.useEffect(() => {
    setNotes(report?.notes || '');
  }, [report]);
  if (!report) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Notu Düzenle</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Notlar"
          multiline
          rows={4}
          fullWidth
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">İptal</Button>
        <Button onClick={() => onSave(report.id, notes)} variant="contained" color="primary">Kaydet</Button>
      </DialogActions>
    </Dialog>
  );
}

const statusOptions = ['Submitted', 'Reviewed'];

export default function ReportsTable({ reports, loading, fetchReports, userList }) {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ date: '', status: '', userId: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const dateMatch = !filters.date || (r.date && r.date.startsWith(filters.date));
      const statusMatch = !filters.status || r.status === filters.status;
      const userMatch = !filters.userId || r.user_id === filters.userId;
      return dateMatch && statusMatch && userMatch;
    });
  }, [reports, filters]);

  const handleDelete = async (reportId) => {
    if (window.confirm('Bu raporu silmek istediğine emin misin?')) {
      try {
        await deleteReport(reportId);
        if (fetchReports) fetchReports();
      } catch (err) {
        setError('Silme işlemi başarısız.');
      }
    }
  };

  const handleUpdate = async (reportId, newNotes) => {
    try {
      await updateReport(reportId, { notes: newNotes });
      setEditingReport(null);
      if (fetchReports) fetchReports();
    } catch (err) {
      setError('Not güncelleme başarısız.');
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      if (fetchReports) fetchReports();
    } catch (err) {
      setError('Durum güncelleme başarısız.');
    }
  };

  if (loading) return <Typography sx={{ p: 2 }}>Yükleniyor...</Typography>;
  if (error) return <Typography color="error" sx={{ p: 2 }}>{error}</Typography>;
  if (!filteredReports.length) return <Typography sx={{ p: 2 }}>Hiç rapor yok.</Typography>;

  return (
    <Paper sx={{ mt: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Filter by Date"
          type="date"
          name="date"
          value={filters.date}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        />
        <TextField
          select
          label="Status"
          name="status"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          sx={{ width: 150 }}
        >
          <MenuItem value=""><em>Hepsi</em></MenuItem>
          {statusOptions.map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        {userList && (
          <TextField
            select
            label="Employee"
            name="userId"
            value={filters.userId}
            onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
            sx={{ width: 200 }}
          >
            <MenuItem value=""><em>Hepsi</em></MenuItem>
            {userList.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</MenuItem>
            ))}
          </TextField>
        )}
      </Box>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Çalışan</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell>Notlar</TableCell>
              <TableCell>Dosya</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Görüntüle</TableCell>
              <TableCell>Aksiyon</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((r) => (
              <TableRow hover key={r.id}>
                <TableCell>{r.user?.first_name || ''} {r.user?.last_name || ''}</TableCell>
                <TableCell>{r.date || (r.created_at ? new Date(r.created_at).toLocaleString() : '')}</TableCell>
                <TableCell>{r.notes}</TableCell>
                <TableCell><DownloadLink filePath={r.file_path} /></TableCell>
                <TableCell><Chip label={r.status} size="small" /></TableCell>
                <TableCell>
                  <IconButton onClick={() => setSelectedReport(r)}><VisibilityIcon /></IconButton>
                </TableCell>
                <TableCell>
                  {(user.id === r.user_id) && (
                    <>
                      <IconButton onClick={() => setEditingReport(r)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                    </>
                  )}
                  {user.role === 'manager' && r.status === 'Submitted' && (
                    <IconButton onClick={() => handleStatusChange(r.id, 'Reviewed')} title="Reviewed yap"><CheckCircleOutlineIcon /></IconButton>
                  )}
                  {user.role === 'manager' && r.status === 'Reviewed' && (
                    <IconButton onClick={() => handleStatusChange(r.id, 'Submitted')} title="Submitted yap"><UndoIcon /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ReportDetailModal open={!!selectedReport} report={selectedReport} onClose={() => setSelectedReport(null)} />
      <EditReportModal open={!!editingReport} report={editingReport} onClose={() => setEditingReport(null)} onSave={handleUpdate} />
    </Paper>
  );
}
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Box,
  TextField,
  MenuItem
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { deleteReport, updateReport, updateReportStatus, getAllUsers } from '../services/reportService';
import { formatInTimeZone } from 'date-fns-tz';

// Durum renkleri
const statusColors = {
  'Submitted': 'info',
  'In Review': 'warning',
  'Approved': 'success',
  'Rejected': 'error'
};

// Rapor Detay Modal Bileşeni
function ReportDetailModal({ open, onClose, report }) {
  const [downloadUrl, setDownloadUrl] = useState('');

  React.useEffect(() => {
    if (report && open) {
      supabase.storage
        .from('reports')
        .createSignedUrl(report.file_path, 60)
        .then(({ data }) => setDownloadUrl(data?.signedUrl));
    }
  }, [report, open]);

  if (!report) return null;

  const fullName = report.notes ? report.notes.split(' ')[0] : 'Bilinmiyor';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Rapor Detayları</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Çalışan:</strong> {report.user ? `${report.user.first_name} ${report.user.last_name}` : 'Bilinmiyor'}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Tarih:</strong> {new Date(report.created_at).toLocaleString('tr-TR')}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Durum:</strong> <Chip label={report.status} color={statusColors[report.status]} size="small" />
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Notlar:</strong> {report.notes || 'Not eklenmemiş'}
        </Typography>
        {downloadUrl && (
          <Button
            variant="contained"
            color="primary"
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 16 }}
          >
            Raporu İndir
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ReportsTable({ reports = [], filters, setFilters, onReportUpdated }) {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Kullanıcıları yükle
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      onReportUpdated();
    } catch (error) {
      console.error('Status güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteReport(reportId);
        onReportUpdated();
      } catch (error) {
        console.error('Silme hatası:', error);
        alert('Rapor silinirken bir hata oluştu');
      }
    }
  };

  // Filtreli raporlar
  const filteredReports = reports.filter(report => {
    const dateMatch = !filters?.date || new Date(report.created_at).toISOString().split('T')[0] === filters.date;
    const statusMatch = !filters?.status || report.status === filters.status;
    const userMatch = !filters?.userId || report.user_id === filters.userId;
    return dateMatch && statusMatch && userMatch;
  });

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Tarihe Göre Filtrele"
          type="date"
          value={filters?.date || ''}
          onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          select
          label="Durum"
          value={filters?.status || ''}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Tümü</MenuItem>
          <MenuItem value="Submitted">Gönderildi</MenuItem>
          <MenuItem value="Reviewed">İncelendi</MenuItem>
          <MenuItem value="Approved">Onaylandı</MenuItem>
        </TextField>
        <TextField
          select
          label="Çalışan"
          value={filters?.userId || ''}
          onChange={e => setFilters(f => ({ ...f, userId: e.target.value }))}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tüm Çalışanlar</MenuItem>
          {users.map(user => (
            <MenuItem key={user.id} value={user.id}>
              {user.first_name} {user.last_name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Çalışan</strong></TableCell>
              <TableCell><strong>Tarih/Saat</strong></TableCell>
              <TableCell><strong>Durum</strong></TableCell>
              <TableCell align="right"><strong>İşlemler</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReports.map((report) => {
              console.log('Rendering report:', report);
              return (
                <TableRow key={report.id}>
                  <TableCell>
                    {report.user ? `${report.user.first_name} ${report.user.last_name}` : 'Bilinmiyor'}
                  </TableCell>
                  <TableCell>
                    {new Date(report.created_at).toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={statusColors[report.status]} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        console.log('Opening report details:', report);
                        setSelectedReport(report);
                        setDetailModalOpen(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      color={report.status === 'Approved' ? 'success' : 'primary'}
                      onClick={() => handleStatusChange(
                        report.id,
                        report.status === 'Approved' ? 'In Review' : 'Approved'
                      )}
                      style={{ marginLeft: 8 }}
                    >
                      {report.status === 'Approved' ? 'Onayı Kaldır' : 'Onayla'}
                    </Button>
                    <IconButton
                      onClick={() => handleDelete(report.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ReportDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
      />
    </>
  );
}
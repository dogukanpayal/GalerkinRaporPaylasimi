import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, Chip, Box,
  TextField, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../services/supabaseClient';

const statusColors = {
  'Not Reviewed': 'warning',
  'Reviewed': 'success'
};

// UTC stringleri doğru parse etmek için yardımcı fonksiyon
function parseUTCDate(dateString) {
  if (dateString && !dateString.endsWith('Z')) {
    return new Date(dateString.replace(' ', 'T') + 'Z');
  }
  return new Date(dateString);
}

export default function ReportsTable({ reports = [], filters, setFilters, onReportUpdated, allReports = reports, hideUploaderFilter }) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [uniqueUploaders, setUniqueUploaders] = useState([]);

  // Benzersiz yükleyicileri TÜM raporlardan al (filtrelenmemiş)
  useEffect(() => {
    const getUniqueUploaders = () => {
      const uploadersMap = new Map();
      
      // allReports kullan (filtrelenmemiş tüm raporlar)
      allReports.forEach(report => {
        if (report.uploader_first_name && report.uploader_last_name) {
          const uploaderId = `${report.uploader_first_name}-${report.uploader_last_name}`;
          if (!uploadersMap.has(uploaderId)) {
            uploadersMap.set(uploaderId, {
              id: uploaderId,
              first_name: report.uploader_first_name,
              last_name: report.uploader_last_name,
              fullName: `${report.uploader_first_name} ${report.uploader_last_name}`
            });
          }
        }
      });

      return Array.from(uploadersMap.values())
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
    };

    const uploaders = getUniqueUploaders();
    console.log('Unique uploaders from all reports:', uploaders);
    setUniqueUploaders(uploaders);
  }, [allReports]); // reports yerine allReports'u dinle

  const handleFilterChange = (field, value) => {
    console.log('Changing filter:', field, value);
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await onReportUpdated(reportId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      try {
        await onReportUpdated(reportId, null, true);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  // Filtreleme işlemini burada yap
  const filteredReports = reports.filter(report => {
    const dateMatch = !filters.date || new Date(report.created_at).toISOString().split('T')[0] === filters.date;
    const statusMatch = !filters.status || report.status === filters.status;
    const uploaderMatch = !filters.uploaderId || 
      (report.uploader_first_name && report.uploader_last_name && 
       `${report.uploader_first_name}-${report.uploader_last_name}` === filters.uploaderId);
    return dateMatch && statusMatch && uploaderMatch;
  });

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="Tarihe Göre Filtrele"
          value={filters.date || ''}
          onChange={(e) => handleFilterChange('date', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="Durum"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">Tüm Durumlar</MenuItem>
          <MenuItem value="Not Reviewed">İncelenmedi</MenuItem>
          <MenuItem value="Reviewed">İncelendi</MenuItem>
        </TextField>
        {!hideUploaderFilter && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Çalışan</InputLabel>
            <Select
              value={filters.uploaderId || ''}
              label="Çalışan"
              onChange={(e) => handleFilterChange('uploaderId', e.target.value)}
            >
              <MenuItem value="">Tüm Çalışanlar</MenuItem>
              {uniqueUploaders.map((uploader) => (
                <MenuItem key={uploader.id} value={uploader.id}>
                  {uploader.fullName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
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
            {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                  {report.uploader_first_name && report.uploader_last_name 
                    ? `${report.uploader_first_name} ${report.uploader_last_name}`
                    : 'Bilinmeyen Kullanıcı'}
                  </TableCell>
                  <TableCell>
                  {parseUTCDate(report.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                    label={report.status === 'Reviewed' ? 'İncelendi' : 'İncelenmedi'}
                    color={report.status === 'Reviewed' ? 'success' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setSelectedReport(report);
                        setDetailModalOpen(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                    color={report.status === 'Reviewed' ? 'success' : 'primary'}
                        onClick={() => handleStatusChange(
                          report.id,
                      report.status === 'Reviewed' ? 'Not Reviewed' : 'Reviewed'
                        )}
                        style={{ marginLeft: 8 }}
                      >
                    {report.status === 'Reviewed' ? 'İncelenmedi Yap' : 'İncelendi Yap'}
                      </Button>
                      <IconButton
                        onClick={() => handleDelete(report.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rapor Detayları</DialogTitle>
        {selectedReport && (
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Çalışan:</strong> {selectedReport.uploader_first_name && selectedReport.uploader_last_name 
                ? `${selectedReport.uploader_first_name} ${selectedReport.uploader_last_name}`
                : 'Bilinmeyen Kullanıcı'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Tarih:</strong> {parseUTCDate(selectedReport.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Durum:</strong> <Chip label={selectedReport.status === 'Reviewed' ? 'İncelendi' : 'İncelenmedi'} color={selectedReport.status === 'Reviewed' ? 'success' : 'primary'} size="small" />
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Notlar:</strong> {selectedReport.notes || 'Not eklenmemiş'}
            </Typography>
            {selectedReport.file_path && (
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  const { data } = await supabase.storage
                    .from('reports')
                    .createSignedUrl(selectedReport.file_path, 60);
                  if (data?.signedUrl) {
                    window.open(data.signedUrl, '_blank');
                  }
                }}
                style={{ marginTop: 16 }}
              >
                Raporu İndir
              </Button>
            )}
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
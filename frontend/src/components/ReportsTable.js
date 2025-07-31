import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, Chip, Box,
  TextField, MenuItem, Select, FormControl, InputLabel, Card
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [uniqueUploaders, setUniqueUploaders] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // Kullanıcının rolünü al
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }
    fetchUserRole();
  }, [user]);

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
      {/* Filtreler */}
      <Card sx={{ 
        mb: 3, 
        p: 3,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderRadius: 2
      }}>
        <Typography variant="h6" sx={{ 
          mb: 2,
          fontWeight: 600,
          color: '#1C1F2A'
        }}>
          Filtreler
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            label="Tarihe Göre Filtrele"
            value={filters.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            label="Durum"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ minWidth: 150 }}
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
      </Card>

      {/* Tablo */}
      <Card sx={{ 
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                <TableCell sx={{ 
                  fontWeight: 600,
                  color: '#1C1F2A',
                  fontSize: '14px',
                  py: 2
                }}>
                  Çalışan
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  color: '#1C1F2A',
                  fontSize: '14px',
                  py: 2
                }}>
                  Tarih/Saat
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600,
                  color: '#1C1F2A',
                  fontSize: '14px',
                  py: 2
                }}>
                  Durum
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600,
                  color: '#1C1F2A',
                  fontSize: '14px',
                  py: 2
                }}>
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                  <TableRow key={report.id} sx={{ 
                    '&:hover': {
                      backgroundColor: '#F8FFF8'
                    }
                  }}>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#1C1F2A' }}>
                        {report.uploader_first_name && report.uploader_last_name 
                          ? `${report.uploader_first_name} ${report.uploader_last_name}`
                          : 'Bilinmeyen Kullanıcı'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#666666' }}>
                        {parseUTCDate(report.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={report.status === 'Reviewed' ? 'İncelendi' : 'İncelenmedi'}
                        color={report.status === 'Reviewed' ? 'success' : 'warning'}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '12px'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                          onClick={() => {
                            setSelectedReport(report);
                            setDetailModalOpen(true);
                          }}
                          sx={{ 
                            color: '#3C8D40',
                            '&:hover': { backgroundColor: '#E8F5E8' }
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {/* Sadece yöneticiler durum değiştirme butonunu görebilir */}
                        {userRole === 'Yonetici' && (
                          <Box
                            onClick={() => handleStatusChange(
                              report.id,
                              report.status === 'Reviewed' ? 'Not Reviewed' : 'Reviewed'
                            )}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Typography
                              sx={{
                                color: report.status === 'Reviewed' ? '#FF9800' : '#4CAF50',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                lineHeight: 1
                              }}
                            >
                              {report.status === 'Reviewed' ? '↺' : '✓'}
                            </Typography>
                          </Box>
                        )}
                        <IconButton
                          onClick={() => handleDelete(report.id)}
                          sx={{ 
                            color: '#F44336',
                            '&:hover': { backgroundColor: '#FFEBEE' }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Detay Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#F8F9FA',
          borderBottom: '1px solid #E0E0E0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1F2A' }}>
            Rapor Detayları
          </Typography>
        </DialogTitle>
        {selectedReport && (
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1C1F2A', mb: 0.5 }}>
                  Çalışan:
                </Typography>
                <Typography variant="body1">
                  {selectedReport.uploader_first_name && selectedReport.uploader_last_name 
                    ? `${selectedReport.uploader_first_name} ${selectedReport.uploader_last_name}`
                    : 'Bilinmeyen Kullanıcı'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1C1F2A', mb: 0.5 }}>
                  Tarih:
                </Typography>
                <Typography variant="body1">
                  {parseUTCDate(selectedReport.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1C1F2A', mb: 0.5 }}>
                  Durum:
                </Typography>
                <Chip 
                  label={selectedReport.status === 'Reviewed' ? 'İncelendi' : 'İncelenmedi'} 
                  color={selectedReport.status === 'Reviewed' ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1C1F2A', mb: 0.5 }}>
                  Notlar:
                </Typography>
                <Typography variant="body1">
                  {selectedReport.notes || 'Not eklenmemiş'}
                </Typography>
              </Box>
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
                  sx={{ 
                    mt: 2,
                    backgroundColor: '#3C8D40',
                    '&:hover': { backgroundColor: '#2E7D32' }
                  }}
                >
                  Raporu İndir
                </Button>
              )}
            </Box>
          </DialogContent>
        )}
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E0E0E0' }}>
          <Button 
            onClick={() => setDetailModalOpen(false)}
            sx={{ 
              color: '#666666',
              '&:hover': { backgroundColor: '#F5F5F5' }
            }}
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
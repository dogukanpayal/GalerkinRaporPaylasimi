import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import ReportsTable from '../components/ReportsTable';
import UploadReportCard from '../components/UploadReportCard';
import { getAllReports, updateReportStatus, deleteReport } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    uploaderId: ''
  });

  // Raporları filtrele
  const filteredReports = reports.filter(report => {
    const dateMatch = !filters.date || new Date(report.created_at).toISOString().split('T')[0] === filters.date;
    const statusMatch = !filters.status || report.status === filters.status;
    const uploaderMatch = !filters.uploaderId || 
      (report.uploader_first_name && report.uploader_last_name && 
       `${report.uploader_first_name}-${report.uploader_last_name}` === filters.uploaderId);
    
    return dateMatch && statusMatch && uploaderMatch;
  });

  // Raporları getir
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log('Fetching all reports...');
      const fetchedReports = await getAllReports();
      console.log('Fetched reports:', fetchedReports);
      setReports(fetchedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Rapor güncelleme işleyicisi
  const handleReportUpdated = async (reportId, newStatus, isDelete = false) => {
    try {
      if (isDelete) {
        await deleteReport(reportId);
      } else {
        await updateReportStatus(reportId, newStatus);
      }
      await fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  // Yükleme başarılı işleyicisi
  const handleUploadSuccess = useCallback(() => {
    console.log('Report uploaded successfully, refreshing list...');
    fetchReports();
  }, [fetchReports]);

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Rapor Listesi
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UploadReportCard onUploadSuccess={handleUploadSuccess} />
        </Grid>
        
        <Grid item xs={12}>
          {loading ? (
            <Typography>Yükleniyor...</Typography>
          ) : (
            <ReportsTable
              reports={filteredReports}
              allReports={reports} // Filtrelenmemiş tüm raporları geçir
              filters={filters}
              setFilters={setFilters}
              onReportUpdated={handleReportUpdated}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
} 
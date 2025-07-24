import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import ReportsTable from '../components/ReportsTable';
import UploadReportCard from '../components/UploadReportCard';
import { getMyReports, getAllReports, getAllUsers } from '../services/reportService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    userId: ''
  });

  const fetchReports = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching reports...');
      
      // Her zaman tüm raporları getir
      const fetchedReports = await getAllReports(filters);
      console.log('Fetched reports:', fetchedReports);
      
      setReports(fetchedReports || []);
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
      setError('Raporlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUploadSuccess = useCallback(() => {
    console.log('Rapor yüklendi, liste yenileniyor...');
    fetchReports();
  }, [fetchReports]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Rapor Listesi
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <UploadReportCard onUploadSuccess={handleUploadSuccess} />
        </Grid>

        <Grid item xs={12}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Typography>Yükleniyor...</Typography>
          ) : (
            <ReportsTable
              reports={reports}
              filters={filters}
              setFilters={setFilters}
              onReportUpdated={fetchReports}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
} 
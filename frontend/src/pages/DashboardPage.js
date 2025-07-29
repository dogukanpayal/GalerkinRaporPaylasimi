import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import ReportsTable from '../components/ReportsTable';
import UploadReportCard from '../components/UploadReportCard';
import { getAllReports, updateReportStatus, deleteReport } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    uploaderId: ''
  });

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
      console.log('Fetching reports...');
      const fetchedReports = await getAllReports();
      console.log('Fetched reports:', fetchedReports);
      
      // Eğer kullanıcı çalışan rolündeyse, sadece kendi raporlarını göster
      if (userRole === 'Calisan') {
        const userReports = fetchedReports.filter(report => report.user_id === user.id);
        setReports(userReports);
        console.log('Filtered to user reports:', userReports);
      } else {
        // Yönetici ise tüm raporları göster
        setReports(fetchedReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  useEffect(() => {
    if (userRole) {
      fetchReports();
    }
  }, [fetchReports, userRole]);

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
    fetchReports();
  }, [fetchReports]);

  if (!user || !userRole) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {userRole === 'Calisan' ? 'Raporlarım' : 'Tüm Raporlar'}
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
              hideUploaderFilter={userRole === 'Calisan'} // Çalışan ise yükleyici filtresini gizle
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
} 
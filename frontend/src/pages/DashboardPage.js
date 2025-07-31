import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
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
      // Önce local state'i güncelle (anında görünüm için)
      setReports(prevReports => {
        if (isDelete) {
          return prevReports.filter(report => report.id !== reportId);
        } else {
          return prevReports.map(report => 
            report.id === reportId 
              ? { ...report, status: newStatus }
              : report
          );
        }
      });

      // Sonra backend'e gönder
      if (isDelete) {
        await deleteReport(reportId);
      } else {
        await updateReportStatus(reportId, newStatus);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      // Hata durumunda listeyi yeniden yükle
      fetchReports();
    }
  };

  // Yükleme başarılı işleyicisi
  const handleUploadSuccess = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  if (!user || !userRole) return null;

  return (
    <Box sx={{ 
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Rapor Yükleme Kartı */}
          <Grid item xs={12}>
            <UploadReportCard onUploadSuccess={handleUploadSuccess} />
          </Grid>

          {/* Raporlar Tablosu */}
          <Grid item xs={12}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 8
              }}>
                <Typography variant="h6" sx={{ color: '#666666' }}>
                  Raporlar yükleniyor...
                </Typography>
              </Box>
            ) : (
              <ReportsTable
                reports={filteredReports}
                allReports={reports}
                filters={filters}
                setFilters={setFilters}
                onReportUpdated={handleReportUpdated}
                hideUploaderFilter={userRole === 'Calisan'}
              />
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 
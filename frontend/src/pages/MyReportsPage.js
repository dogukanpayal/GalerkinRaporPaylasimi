import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllReports, updateReportStatus, deleteReport } from '../services/reportService';
import ReportsTable from '../components/ReportsTable';
import { Container, Typography } from '@mui/material';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    uploaderId: ''
  });

  useEffect(() => {
    async function fetchReports() {
      if (!user) return;
      const allReports = await getAllReports();
      setReports(allReports.filter(r => r.user_id === user.id));
      setLoading(false);
    }
    fetchReports();
  }, [user]);

  // Rapor güncelleme işleyicisi
  const handleReportUpdated = async (reportId, newStatus, isDelete = false) => {
    try {
      if (isDelete) {
        await deleteReport(reportId);
      } else {
        await updateReportStatus(reportId, newStatus);
      }
      // Yeniden yükle
      const allReports = await getAllReports();
      setReports(allReports.filter(r => r.user_id === user.id));
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Yüklediğim Raporlar
      </Typography>
      {loading ? <div>Yükleniyor...</div> : (
        <ReportsTable
          reports={reports}
          allReports={reports}
          filters={filters}
          setFilters={setFilters}
          onReportUpdated={handleReportUpdated}
          hideUploaderFilter={true}
        />
      )}
    </Container>
  );
} 
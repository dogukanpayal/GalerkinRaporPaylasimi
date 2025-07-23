import React, { useState, useEffect, useCallback } from 'react';
import UploadReportCard from '../components/UploadReportCard';
import ReportsTable from '../components/ReportsTable';
import { useAuth } from '../contexts/AuthContext';
import { getMyReports, getAllReports } from '../services/reportService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', userId: '' });

  // Kullanıcı listesini çek (sadece yöneticiler için)
  useEffect(() => {
    async function fetchUsers() {
      if (user && user.role === 'manager') {
        // Supabase'dan tüm kullanıcıları çek
        const { data, error } = await window.supabase
          .from('users')
          .select('id, first_name, last_name');
        if (!error) setUserList(data);
      }
    }
    fetchUsers();
  }, [user]);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      if (user.role === 'manager') {
        data = await getAllReports(filters);
      } else {
        data = await getMyReports(user.id);
      }
      setReports(data);
    } catch (err) {
      setReports([]);
    }
    setLoading(false);
  }, [user, filters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUploadSuccess = () => {
    fetchReports();
  };

  return (
    <>
      <UploadReportCard onUpload={handleUploadSuccess} />
      <ReportsTable
        reports={reports}
        loading={loading}
        fetchReports={fetchReports}
        userList={user.role === 'manager' ? userList : undefined}
      />
    </>
  );
} 
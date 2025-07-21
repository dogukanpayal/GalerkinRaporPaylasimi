import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UploadReportCard from '../components/UploadReportCard';
import ReportsTable from '../components/ReportsTable';
import { useAuth } from '../contexts/AuthContext';
import { getMyReports, getAllReports, getReporters } from '../services/api';

export default function DashboardPage() {
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', userId: '' });
  const [sorting, setSorting] = useState({ field: 'createdAt', direction: 'desc' });
  const [page, setPage] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [reporters, setReporters] = useState([]);
  const { user } = useAuth();
  const location = useLocation();
  
  const isMyReportsView = location.pathname === '/my-reports';
  const ROWS_PER_PAGE = 10;

  const fetchReports = async () => {
    if (!user) return;
    try {
      const params = {
        ...filters,
        sortBy: sorting.field,
        sortOrder: sorting.direction,
        page: page + 1,
        size: ROWS_PER_PAGE,
      };
      
      const fetchFn = isMyReportsView ? getMyReports : getAllReports;
      const data = await fetchFn(params);
      
      setReports(data.reports);
      setTotalReports(data.totalItems);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
      setTotalReports(0);
    }
  };
  
  const handleUploadSuccess = () => {
    if (page !== 0) {
      setPage(0);
    } else {
      fetchReports();
    }
  };

  useEffect(() => {
    // Fetch the list of users who have submitted reports for the filter dropdown
    if (user && !isMyReportsView) {
      const fetchReportersList = async () => {
        try {
          const data = await getReporters();
          setReporters(data);
        } catch (error) {
          console.error("Could not fetch reporters list");
        }
      };
      fetchReportersList();
    }
  }, [user, isMyReportsView]);

  useEffect(() => {
    fetchReports();
  }, [user, filters, sorting, page, isMyReportsView]); // Add isMyReportsView to dependency array

  return (
    <>
      {!isMyReportsView && <UploadReportCard onUpload={handleUploadSuccess} />}
      <ReportsTable
        reports={reports}
        filters={filters}
        setFilters={setFilters}
        fetchReports={fetchReports}
        sorting={sorting}
        setSorting={setSorting}
        page={page}
        setPage={setPage}
        rowsPerPage={ROWS_PER_PAGE}
        totalReports={totalReports}
        isMyReportsView={isMyReportsView}
        reporters={reporters}
      />
    </>
  );
} 
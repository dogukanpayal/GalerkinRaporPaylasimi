import React, { useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Box, Button, TextField,
  IconButton, TableSortLabel, TablePagination, Chip, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import UndoIcon from '@mui/icons-material/Undo';
import ReportDetailModal from './ReportDetailModal';
import EditReportModal from './EditReportModal';
import { useAuth } from '../contexts/AuthContext';
import { deleteReport, updateReport, updateReportStatus } from '../services/api';

const statusOptions = ['Submitted', 'Reviewed'];

const getEmployeeName = (reportUser) => {
  if (!reportUser) return 'Unknown User';
  // Handle potential inconsistencies in user data structure
  const user = reportUser.dataValues || reportUser;
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
}

export default function ReportsTable({
  reports,
  filters,
  setFilters,
  fetchReports,
  sorting,
  setSorting,
  page,
  setPage,
  rowsPerPage,
  totalReports,
  isMyReportsView,
  reporters,
}) {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);

  const handleViewClick = (report) => {
    setSelectedReport(report);
  };

  const handleCloseDetailModal = () => {
    setSelectedReport(null);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
        fetchReports();
      } catch (error) {
        console.error('Failed to delete report:', error);
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  const handleReviewClick = async (reportId) => {
    try {
      await updateReportStatus(reportId, 'Reviewed');
      fetchReports();
    } catch (error) {
      console.error('Failed to mark report as reviewed:', error);
      alert('Failed to mark report as reviewed. Please try again.');
    }
  };

  const handleUndoReviewClick = async (reportId) => {
    try {
      await updateReportStatus(reportId, 'Submitted');
      fetchReports();
    } catch (error) {
      console.error('Failed to revert report status:', error);
      alert('Failed to revert report status. Please try again.');
    }
  };

  const handleUpdate = async (reportId, newNotes) => {
    try {
      await updateReport(reportId, { notes: newNotes });
      setEditingReport(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  const handleSortRequest = (property) => {
    const isAsc = sorting.field === property && sorting.direction === 'asc';
    setSorting({ field: property, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEditModalClose = () => {
    setEditingReport(null);
  };

  const handleEditModalSave = (newNotes) => {
    if (!editingReport) {
      console.error("No report selected for editing.");
      return;
    }
    handleUpdate(editingReport.id, newNotes);
  };

  const isActionable = (report) => {
    if (!user) return false;
    return user.id === report.userId || user.role === 'manager';
  };
    
  return (
    <Paper sx={{ mt: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #ddd' }}>
        <Typography variant="h6" component="div">
          {isMyReportsView ? 'My Reports' : 'Reports'}
        </Typography>
      </Box>
      {!isMyReportsView && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Filter by Date"
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 200 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                name="userId"
                value={filters.userId || ''}
                onChange={handleFilterChange}
                label="Employee"
              >
                <MenuItem value="">
                  <em>All Employees</em>
                </MenuItem>
                {reporters.map((reporter) => (
                  <MenuItem key={reporter.id} value={reporter.id}>
                    {`${reporter.firstName} ${reporter.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {!isMyReportsView && (
                <TableCell sortDirection={sorting.field === 'employee' ? sorting.direction : false}>
                  <TableSortLabel
                    active={sorting.field === 'employee'}
                    direction={sorting.direction}
                    onClick={() => handleSortRequest('employee')}
                  >
                    Employee
                  </TableSortLabel>
                </TableCell>
              )}
              <TableCell sortDirection={sorting.field === 'createdAt' ? sorting.direction : false}>
                <TableSortLabel
                  active={sorting.field === 'createdAt'}
                  direction={sorting.direction}
                  onClick={() => handleSortRequest('createdAt')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMyReportsView ? 4 : 5} align="center">
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r) => (
                <TableRow hover key={r.id}>
                  {!isMyReportsView && (
                    <TableCell>{getEmployeeName(r.User || r.user)}</TableCell>
                  )}
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={r.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewClick(r)}>VIEW</Button>
                  </TableCell>
                  <TableCell>
                    {isActionable(r) && (
                      <>
                        <IconButton onClick={() => setEditingReport(r)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                      </>
                    )}
                    {user.role === 'manager' && r.status === 'Submitted' && (
                      <IconButton onClick={() => handleReviewClick(r.id)} title="Mark as Reviewed">
                        <CheckCircleOutlineIcon />
                      </IconButton>
                    )}
                    {user.role === 'manager' && r.status === 'Reviewed' && (
                      <IconButton onClick={() => handleUndoReviewClick(r.id)} title="Mark as Submitted (Undo)">
                        <UndoIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={totalReports}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
      {selectedReport && (
        <ReportDetailModal
          open={Boolean(selectedReport)}
          onClose={handleCloseDetailModal}
          report={selectedReport}
        />
      )}
      {editingReport && (
         <EditReportModal
            open={Boolean(editingReport)}
            onClose={handleEditModalClose}
            report={editingReport}
            onSave={handleEditModalSave}
        />
      )}
    </Paper>
  );
}
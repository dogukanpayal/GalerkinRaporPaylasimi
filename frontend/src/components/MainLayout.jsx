import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const location = useLocation();
  
  // Determine the selected menu item based on the current path
  const getSelectedMenu = (pathname) => {
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    return 'Dashboard'; // Default
  };
  
  const [selectedMenu, setSelectedMenu] = useState(getSelectedMenu(location.pathname));

  React.useEffect(() => {
    setSelectedMenu(getSelectedMenu(location.pathname));
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar selected={selectedMenu} onSelect={item => setSelectedMenu(item.text)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - 220px)` }, // Adjust width for sidebar
        }}
      >
        <Header title={selectedMenu} />
        <Box
          sx={{
            p: 3,
            flexGrow: 1,
            bgcolor: '#f5f5f5',
            overflowY: 'auto',
          }}
        >
          <Outlet /> {/* This is where the page content (e.g., DashboardPage, SettingsPage) will be rendered */}
        </Box>
      </Box>
    </Box>
  );
} 
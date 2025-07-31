import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

export default function Header({ title }) {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#3C8D40',
        color: '#FFFFFF',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%'
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', px: 3, width: '100%' }}>
        {/* Orta - Sadece Başlık */}
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600,
            color: '#FFFFFF',
            textAlign: 'center'
          }}
        >
          Galerkin Mühendislik
        </Typography>
      </Toolbar>
    </AppBar>
  );
} 
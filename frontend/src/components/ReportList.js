import React from 'react';
import {
  List, ListItem, ListItemText, Paper, Typography
} from '@mui/material';

export default function ReportList({ reports }) {
  if (!reports.length) {
    return <Typography>No reports submitted yet.</Typography>;
  }
  return (
    <Paper sx={{ p: 2 }}>
      <List>
        {reports.map((r) => (
          <ListItem key={r.id} divider>
            <ListItemText
              primary={r.title}
              secondary={`${r.description} — ${r.date}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
} 
import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Warning,
  Error,
  Info,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
// Removed framer-motion to fix useContext error

const NotificationToast = ({ notifications, onClose }) => {
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
      setOpen(true);
    }
  }, [notifications]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    if (onClose) {
      onClose(currentNotification);
    }
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp /> : <TrendingDown />;
  };

  if (!open || !currentNotification) return null;

  return (
    <Box>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          severity={getSeverity(currentNotification.type)}
          onClose={handleClose}
          icon={getIcon(currentNotification.type)}
          sx={{
            minWidth: 350,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            borderRadius: 2,
          }}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              {currentNotification.trend && (
                <Chip
                  icon={getTrendIcon(currentNotification.trend)}
                  label={currentNotification.change}
                  size="small"
                  color={currentNotification.trend === 'up' ? 'success' : 'error'}
                  variant="outlined"
                />
              )}
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleClose}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {currentNotification.title}
          </AlertTitle>
          <Typography variant="body2">
            {currentNotification.message}
          </Typography>
          {currentNotification.details && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                {currentNotification.details}
              </Typography>
            </Box>
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationToast;

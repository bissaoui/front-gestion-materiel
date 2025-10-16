import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  Notifications,
  Warning,
  CheckCircle,
  Schedule,
  Speed,
} from '@mui/icons-material';
// Removed framer-motion to fix useContext error

const RealTimeWidget = ({ data, onRefresh, loading = false }) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    setLastUpdate(new Date());
  }, [data]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Warning />;
      default: return <Notifications />;
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Données Temps Réel
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={isLive ? 'EN DIRECT' : 'PAUSÉ'}
              color={isLive ? 'success' : 'default'}
              size="small"
              icon={isLive ? <Speed /> : <Schedule />}
            />
            <Tooltip title="Actualiser">
              <IconButton
                onClick={onRefresh}
                disabled={loading}
                size="small"
                sx={{
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && (
          <Box mb={2}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary">
              Mise à jour en cours...
            </Typography>
          </Box>
        )}

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Dernière mise à jour: {formatTime(lastUpdate)}
          </Typography>
        </Box>

        <List dense>
          {data.map((item, index) => (
            <Box
              key={item.id || index}
              sx={{
                animation: `fadeInSlide 0.3s ease-out ${index * 0.1}s both`,
                '@keyframes fadeInSlide': {
                  '0%': { opacity: 0, transform: 'translateX(-20px)' },
                  '100%': { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getStatusColor(item.status)}.main`,
                      width: 32,
                      height: 32,
                    }}
                  >
                    {getStatusIcon(item.status)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="medium">
                        {item.title}
                      </Typography>
                      {item.badge && (
                        <Badge
                          badgeContent={item.badge}
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                        >
                          <Box />
                        </Badge>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                      {item.trend && (
                        <Box display="flex" alignItems="center">
                          {item.trend === 'up' ? (
                            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                          )}
                          <Typography
                            variant="caption"
                            color={item.trend === 'up' ? 'success.main' : 'error.main'}
                            sx={{ ml: 0.5 }}
                          >
                            {item.change}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </CardContent>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Card>
  );
};

export default RealTimeWidget;

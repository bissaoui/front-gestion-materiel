import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  Info,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
// Removed framer-motion to fix useContext error

const MetricsCard = ({
  title,
  value,
  subtitle,
  trend,
  change,
  progress,
  color = 'primary',
  icon,
  status = 'normal',
  details = [],
  onMoreClick,
  className = '',
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'info': return <Info />;
      default: return null;
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp /> : <TrendingDown />;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'success.main' : 'error.main';
  };

  return (
    <Box
      className={`dashboard-card ${className}`}
      sx={{
        animation: 'fadeInUp 0.5s ease-out',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: status !== 'normal' 
            ? `linear-gradient(135deg, ${getStatusColor(status)}.light 0%, ${getStatusColor(status)}.main 100%)`
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          color: status !== 'normal' ? 'white' : 'inherit',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h3" fontWeight="bold" color={status !== 'normal' ? 'white' : 'primary.main'}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {icon && (
                <Avatar
                  sx={{
                    bgcolor: status !== 'normal' ? 'rgba(255,255,255,0.2)' : `${color}.main`,
                    color: status !== 'normal' ? 'white' : 'white',
                  }}
                >
                  {icon}
                </Avatar>
              )}
              {onMoreClick && (
                <IconButton size="small" onClick={onMoreClick}>
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          </Box>

          {trend && change && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Box
                display="flex"
                alignItems="center"
                sx={{ color: getTrendColor(trend) }}
              >
                {getTrendIcon(trend)}
                <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
                  {change}
                </Typography>
              </Box>
              <Chip
                label={trend === 'up' ? 'Hausse' : 'Baisse'}
                size="small"
                color={trend === 'up' ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          )}

          {progress !== undefined && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Progression</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: status !== 'normal' ? 'rgba(255,255,255,0.3)' : 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: status !== 'normal' ? 'white' : `${color}.main`,
                  },
                }}
              />
            </Box>
          )}

          {status !== 'normal' && (
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {getStatusIcon(status)}
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {status === 'success' && 'Tout va bien'}
                {status === 'warning' && 'Attention requise'}
                {status === 'error' && 'Action immédiate nécessaire'}
                {status === 'info' && 'Information importante'}
              </Typography>
            </Box>
          )}

          {details.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <List dense>
                {details.slice(0, 3).map((detail, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: status !== 'normal' ? 'rgba(255,255,255,0.2)' : 'grey.200',
                          color: status !== 'normal' ? 'white' : 'text.secondary',
                        }}
                      >
                        {detail.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color: status !== 'normal' ? 'white' : 'text.primary',
                            fontWeight: 'medium',
                          }}
                        >
                          {detail.label}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: status !== 'normal' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                          }}
                        >
                          {detail.value}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {details.length > 3 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: status !== 'normal' ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        >
                          +{details.length - 3} autres éléments
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricsCard;

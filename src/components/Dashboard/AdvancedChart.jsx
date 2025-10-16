import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  BarChart,
  ShowChart,
  PieChart as PieChartIcon,
  ScatterPlot,
  Radar as RadarIcon,
  ViewModule as TreeMapIcon,
  Timeline,
  Download,
  Fullscreen,
  FilterList,
} from '@mui/icons-material';
// Removed framer-motion to fix useContext error

const chartTypes = [
  { value: 'bar', label: 'Barres', icon: <BarChart /> },
  { value: 'line', label: 'Ligne', icon: <ShowChart /> },
  { value: 'area', label: 'Aire', icon: <AreaChart /> },
  { value: 'pie', label: 'Secteurs', icon: <PieChartIcon /> },
  { value: 'scatter', label: 'Dispersion', icon: <ScatterPlot /> },
  { value: 'radar', label: 'Radar', icon: <RadarIcon /> },
  { value: 'treemap', label: 'Treemap', icon: <TreeMapIcon /> },
];

const AdvancedChart = ({
  title,
  data,
  dataKey,
  xAxisKey,
  yAxisKey,
  color = '#1976d2',
  colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'],
  height = 300,
  showControls = true,
  onExport,
}) => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('7d');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data;
  }, [data]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <RechartsBarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <RechartsTooltip />
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={color} />
          </RechartsBarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <RechartsTooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <RechartsTooltip />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <RechartsTooltip />
            {showLegend && <Legend />}
            <Scatter dataKey={dataKey} fill={color} />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxisKey} />
            <PolarRadiusAxis />
            <Radar
              name={dataKey}
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
            <RechartsTooltip />
            {showLegend && <Legend />}
          </RadarChart>
        );

      case 'treemap':
        return (
          <Treemap
            width={400}
            height={200}
            data={chartData}
            dataKey={dataKey}
            ratio={4 / 3}
            stroke="#fff"
            fill={color}
          >
            <RechartsTooltip />
          </Treemap>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        animation: 'fadeInUp 0.5s ease-out',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          <Box display="flex" gap={1}>
            {onExport && (
              <Tooltip title="Exporter">
                <IconButton onClick={() => onExport(chartType)} size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Plein écran">
              <IconButton size="small">
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {showControls && (
          <Box mb={2}>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(e, newType) => newType && setChartType(newType)}
                size="small"
              >
                {chartTypes.map((type) => (
                  <ToggleButton key={type.value} value={type.value}>
                    <Tooltip title={type.label}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {type.icon}
                      </Box>
                    </Tooltip>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Période</InputLabel>
                <Select
                  value={timeRange}
                  label="Période"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="1d">1 jour</MenuItem>
                  <MenuItem value="7d">7 jours</MenuItem>
                  <MenuItem value="30d">30 jours</MenuItem>
                  <MenuItem value="90d">90 jours</MenuItem>
                  <MenuItem value="1y">1 an</MenuItem>
                </Select>
              </FormControl>

              <Chip
                label="Légende"
                color={showLegend ? 'primary' : 'default'}
                onClick={() => setShowLegend(!showLegend)}
                size="small"
              />
              <Chip
                label="Grille"
                color={showGrid ? 'primary' : 'default'}
                onClick={() => setShowGrid(!showGrid)}
                size="small"
              />
            </Box>
          </Box>
        )}

        <Box sx={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AdvancedChart;

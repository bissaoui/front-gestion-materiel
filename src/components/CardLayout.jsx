import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';

const CardLayout = ({ title, navTabs, currentPath, children }) => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
    <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
      <CardContent>
        {title && (
          <Typography variant="h4" fontWeight={700} mb={2} color="primary.dark">
            {title}
          </Typography>
        )}
        {navTabs && navTabs.length > 0 && (
          <Tabs
            value={navTabs.findIndex(tab => tab.to === currentPath)}
            sx={{ mb: 3 }}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {navTabs.map((tab) => (
              <Tab key={tab.to} label={tab.label} component={Link} to={tab.to} />
            ))}
          </Tabs>
        )}
        {children}
      </CardContent>
    </Card>
  </Box>
);

export default CardLayout; 
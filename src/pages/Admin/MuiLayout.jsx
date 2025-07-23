import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled, alpha } from '@mui/material/styles';
import ModernDashboard from './ModernDashboard';
import logoAndzoa from '../../assets/logo-andzoa.png';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { Link, useLocation } from 'react-router-dom';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import CategoryIcon from '@mui/icons-material/Category';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const drawerWidth = 220;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const navItems = [
  { text: 'Accueil', icon: <HomeIcon />, to: '/' },
  { text: 'Dashboard', icon: <DashboardIcon />, to: '/admin-dashboard' },
  { text: 'Dashboard Modern', icon: <DashboardCustomizeIcon />, to: '/modern-dashboard' },
  { text: 'Types', icon: <CategoryIcon />, to: '/types' },
  { text: 'Marques', icon: <BrandingWatermarkIcon />, to: '/marques' },
  { text: 'Modèles', icon: <DevicesOtherIcon />, to: '/modeles' },
  { text: 'Matériels', icon: <DevicesIcon />, to: '/materiels' },
  { text: 'Ajouter Matériel', icon: <AddCircleOutlineIcon />, to: '/ajouter-materiel' },
  { text: 'Demandes', icon: <AssignmentIcon />, to: '/demandes' },
  { text: 'Articles', icon: <ListAltIcon />, to: '/articles' },
  { text: 'Affectations', icon: <AssignmentIndIcon />, to: '/affectations' },
  { text: 'Affectations (liste)', icon: <AssignmentIndIcon />, to: '/affectations-liste' },
  { text: 'Profile', icon: <PeopleIcon />, to: '/profile' },
];

function MuiLayout(props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const drawer = (
    <div style={{ background: '#1B4C43', height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'center', background: '#fff', mb: 1, borderBottom: '1px solid #eee', minHeight: 56 }}>
        <img src={logoAndzoa} alt="ANDZOA Logo" style={{ height: 32 }} />
      </Toolbar>
      <Divider sx={{ borderColor: '#A97B2A' }} />
      <List sx={{ mt: 2 }}>
        {navItems.map((item, index) => (
          <Tooltip title={item.text} placement="right" arrow key={item.text}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  minHeight: 48,
                  justifyContent: 'flex-start',
                  px: 2.5,
                  color: '#fff',
                  '&.Mui-selected, &.Mui-selected:hover': { background: '#A97B2A', color: '#fff' },
                  '&:hover': { background: '#A97B2A', color: '#fff' },
                  borderRadius: 2,
                  mx: 0.5, my: 0.5
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 40, mr: 1 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: '#fff', fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: '#fff', color: '#1B4C43', borderBottom: '1px solid #eee', minHeight: 56 }}>
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <img src={logoAndzoa} alt="ANDZOA Logo" style={{ height: 32, marginRight: 12 }} />
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, color: '#1B4C43', fontSize: 20 }}>
            Agence Nationale pour le Développement des Zones Oasiennes et de l’Arganier
          </Typography>
          <IconButton color="inherit" sx={{ ml: 2 }}>
            <NotificationsIcon sx={{ color: '#A97B2A' }} />
          </IconButton>
          <IconButton color="inherit" sx={{ ml: 1 }} onClick={handleProfileMenuOpen}>
            <AccountCircle sx={{ color: '#A97B2A' }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem onClick={handleMenuClose}>Voir le profil</MenuItem>
            <MenuItem onClick={handleMenuClose}>Modifier les informations</MenuItem>
            <MenuItem onClick={handleMenuClose}>Changer le mot de passe</MenuItem>
            <MenuItem onClick={handleMenuClose} sx={{ color: 'red' }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(10% - ${drawerWidth}px)` }, minHeight: '100vh', px: { xs: 3, sm: 12 } }}
      >
        <Toolbar sx={{ minHeight: 59, p: 1, m: 3 }} />
        {props.children ? props.children : <ModernDashboard />}
      </Box>
    </Box>
  );
}

export default MuiLayout; 
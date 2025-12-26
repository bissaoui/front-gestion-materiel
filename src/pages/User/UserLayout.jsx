import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../context/AuthContext';
import logoAndzoa from '../../assets/logo-andzoa.png';

const drawerWidth = 220;

const userNavItems = [
  { text: 'Accueil', icon: <HomeIcon />, to: '/' },
  { text: 'Mes demandes', icon: <AssignmentIcon />, to: '/demandes' },
  { text: 'Besoins exprimés', icon: <DescriptionIcon />, to: '/besoins-exprimes' },
];

function UserLayout(props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => { setAnchorEl(event.currentTarget); };
  const handleMenuClose = () => { setAnchorEl(null); };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };
  const handleEditProfileClick = () => {
    handleMenuClose();
    navigate('/profile/edit');
  };
  const handleChangePasswordClick = () => {
    handleMenuClose();
    navigate('/profile/password');
  };
  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
  };

  const drawer = (
    <div style={{ height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'center', background: '#fff', mb: 1, borderBottom: '1px solid #eee', minHeight: 56 }}>
        <img src={logoAndzoa} alt="ANDZOA Logo" style={{ height: 32 }} />
      </Toolbar>
      <Divider sx={{ borderColor: '#A97B2A' }} />
      <List sx={{ mt: 2, mb: 1 }}>
        {userNavItems.map((item) => (
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
            Agence Nationale pour le Développement des Zones Oasiennes et de l'Arganier
          </Typography>
          <IconButton color="inherit" sx={{ ml: 1 }} onClick={handleProfileMenuOpen}>
            <AccountCircle sx={{ color: '#A97B2A' }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem onClick={handleProfileClick}>Voir le profil</MenuItem>
            <MenuItem onClick={handleEditProfileClick}>Modifier les informations</MenuItem>
            <MenuItem onClick={handleChangePasswordClick}>Changer le mot de passe</MenuItem>
            <MenuItem onClick={handleLogoutClick} sx={{ color: 'red' }}>Logout</MenuItem>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1B4C43', color: '#fff', backgroundImage: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1B4C43', color: '#fff', backgroundImage: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh', px: { xs: 3, sm: 12 } }}
      >
        <Toolbar sx={{ minHeight: 59, p: 1, m: 3 }} />
        {props.children}
      </Box>
    </Box>
  );
}

export default UserLayout;


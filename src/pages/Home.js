import React from "react";
import MuiLayout from "./Admin/MuiLayout";
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import logo from "../assets/logo.png";

const HomeContent = () => (
  <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6fa' }}>
    <Container maxWidth="sm">
      <Grid container direction="column" alignItems="center" justifyContent="center" spacing={3}>
        <Grid item>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <img
              src={logo}
              alt="ANDZOA Logo"
              style={{ maxWidth: 900, height: 'auto', borderRadius: 12}}
            />
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="h4" component="h1" align="center" fontWeight={700} gutterBottom>
            Bienvenue sur notre plateforme
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="h6" align="center" color="text.secondary">
            Cette plateforme vous permet de créer et gérer vos demandes en toute simplicité.<br/>
            Accédez à vos informations, suivez vos demandes et interagissez avec notre équipe en temps réel.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const Home = () => <MuiLayout children={<HomeContent />} />;

export default Home;

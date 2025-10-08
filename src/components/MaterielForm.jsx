import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import DevicesIcon from '@mui/icons-material/Devices';
import CategoryIcon from '@mui/icons-material/Category';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Autocomplete from '@mui/material/Autocomplete';

const MaterielForm = ({
  numeroSerie, setNumeroSerie,
  selectedType, setSelectedType,
  selectedMarque, setSelectedMarque,
  selectedModele, setSelectedModele,
  selectedMarche, setSelectedMarche,
  types = [], marques = [], modeles = [], marches = [],
  loading, error, success,
  onSubmit,
  submitLabel = "Ajouter le matériel",
  disabled
}) => (
  <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    {success && <Alert severity="success">{success}</Alert>}
    {error && <Alert severity="error">{error}</Alert>}
    <TextField
      label="Numéro de série"
      value={numeroSerie}
      onChange={e => setNumeroSerie(e.target.value)}
      required
      size="small"
      sx={{ minWidth: 200, background: '#fafbfc', borderRadius: 2 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <DevicesIcon color="primary" />
          </InputAdornment>
        )
      }}
      helperText="Obligatoire"
    />
    <TextField
      select
      label="Type de matériel"
      value={selectedType}
      onChange={e => setSelectedType(e.target.value)}
      required
      size="small"
      sx={{ minWidth: 200, background: '#fafbfc', borderRadius: 2 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CategoryIcon color="primary" />
          </InputAdornment>
        )
      }}
      helperText="Obligatoire"
    >
      <MenuItem value="">Sélectionner un type</MenuItem>
      {types.map(type => (
        <MenuItem key={type.id} value={String(type.id)}>{type.nom}</MenuItem>
      ))}
    </TextField>
    <TextField
      select
      label="Marque"
      value={selectedMarque}
      onChange={e => setSelectedMarque(e.target.value)}
      required
      size="small"
      sx={{ minWidth: 200, background: '#fafbfc', borderRadius: 2 }}
      disabled={!selectedType}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <BrandingWatermarkIcon color="primary" />
          </InputAdornment>
        )
      }}
      helperText="Obligatoire"
    >
      <MenuItem value="">Sélectionner une marque</MenuItem>
      {marques.map(marque => (
        <MenuItem key={marque.id} value={String(marque.id)}>{marque.nom}</MenuItem>
      ))}
    </TextField>
    <TextField
      select
      label="Modèle"
      value={selectedModele}
      onChange={e => setSelectedModele(e.target.value)}
      required
      size="small"
      sx={{ minWidth: 200, background: '#fafbfc', borderRadius: 2 }}
      disabled={!selectedMarque}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <DevicesOtherIcon color="primary" />
          </InputAdornment>
        )
      }}
      helperText="Obligatoire"
    >
      <MenuItem value="">Sélectionner un modèle</MenuItem>
      {modeles.map(modele => (
        <MenuItem key={modele.id} value={String(modele.id)}>{modele.nom}</MenuItem>
      ))}
    </TextField>
    <Autocomplete
      options={marches.map(m => ({ label: m.name, id: String(m.id) }))}
      value={marches.map(m => ({ label: m.name, id: String(m.id) })).find(opt => opt.id === String(selectedMarche)) || null}
      onChange={(e, val) => setSelectedMarche(val ? val.id : '')}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Marché (recherchable)"
          size="small"
          sx={{ minWidth: 200, background: '#fafbfc', borderRadius: 2 }}
          helperText="Tapez pour filtrer, laissez vide si non concerné"
        />
      )}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      sx={{ minWidth: 200 }}
    />
    <Button
      type="submit"
      variant="contained"
      color="primary"
      disabled={loading}
      sx={{ minHeight: 44, fontWeight: 600, borderRadius: 3, boxShadow: 2, letterSpacing: 1 }}
      startIcon={<AddCircleIcon />}
    >
      {loading ? <CircularProgress size={22} color="inherit" /> : submitLabel.toUpperCase()}
    </Button>
  </Box>
);

export default MaterielForm; 
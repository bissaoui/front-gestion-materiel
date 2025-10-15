import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../../api/auth';
import { getToken } from '../../../utils/storage';
import { Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import CardLayout from '../../../components/CardLayout';
import navTabs from '../../../components/adminNavTabs';
import {
  TextField,
} from '@mui/material';
import { useTypesSync, useMarquesSync, useModelesSync } from '../../../hooks/useDataSync';

const AffectationMateriel = () => {
  const [searchParams] = useSearchParams();
  const [agents, setAgents] = useState([]);
  const today = new Date().toISOString().slice(0, 10);

  const [materiels, setMateriels] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMarque, setSelectedMarque] = useState(null);
  const [dateAffec, setDateAffec] = useState({ name: '', date: today });
  const [selectedModele, setSelectedModele] = useState(null);
  const [selectedMateriel, setSelectedMateriel] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();

  // Utilisation des hooks de synchronisation
  const { data: types, loading: typesLoading, error: typesError } = useTypesSync();
  const { data: marques, loading: marquesLoading, error: marquesError } = useMarquesSync(selectedType);
  const { data: modeles, loading: modelesLoading, error: modelesError } = useModelesSync(selectedMarque, selectedType);

  // Gestion des erreurs et loading
  const displayError = error || typesError || marquesError || modelesError;
  const isLoading = loading || typesLoading || marquesLoading || modelesLoading;

  // Debug logs pour les états
  console.log('Debug - selectedType:', selectedType);
  console.log('Debug - selectedMarque:', selectedMarque);
  console.log('Debug - selectedModele:', selectedModele);
  console.log('Debug - selectedMateriel:', selectedMateriel);
  console.log('Debug - materiels.length:', materiels.length);

  useEffect(() => {
    // Charger la liste des agents
    axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(res => setAgents(res.data))
      .catch(() => setError("Erreur lors du chargement des agents"));
  }, []);

  // État pour stocker les données du matériel à pré-sélectionner
  const [materielToPreselect, setMaterielToPreselect] = useState(null);
  const preselectExecuted = useRef(false);

  // Gérer le paramètre materielId de l'URL
  useEffect(() => {
    const materielId = searchParams.get('materielId');
    if (materielId) {
      // Charger les détails du matériel spécifique
      axios.get(`${API_URL}/api/materiels/${materielId}`, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      })
      .then(res => {
        const materiel = res.data;
        if (materiel) {
          setMaterielToPreselect(materiel);
          setSuccess(`Matériel pré-sélectionné : ${materiel.numeroSerie}`);
        }
      })
      .catch(() => setError("Erreur lors du chargement du matériel"));
    }
  }, [searchParams]);

  // Pré-sélectionner quand les données sont chargées
  useEffect(() => {
    console.log('Debug - materielToPreselect:', materielToPreselect);
    console.log('Debug - types.length:', types.length);
    console.log('Debug - types:', types);
    
    if (materielToPreselect && types.length > 0) {
      console.log('Debug - Pré-sélection en cours...');
      
      // Pré-sélectionner le type, marque et modèle
      if (materielToPreselect.typeId) {
        console.log('Debug - Sélection du type:', materielToPreselect.typeId);
        setSelectedType(materielToPreselect.typeId);
      }
      if (materielToPreselect.marqueId) {
        console.log('Debug - Sélection de la marque:', materielToPreselect.marqueId);
        setSelectedMarque(materielToPreselect.marqueId);
      }
      if (materielToPreselect.modeleId) {
        console.log('Debug - Sélection du modèle:', materielToPreselect.modeleId);
        setSelectedModele(materielToPreselect.modeleId);
      }
      
      // Pré-sélectionner le matériel
      console.log('Debug - Sélection du matériel:', materielToPreselect.id);
      setSelectedMateriel(materielToPreselect.id.toString());
      
      // Charger la liste des matériels pour ce type/marque/modèle
      if (materielToPreselect.typeId && materielToPreselect.marqueId && materielToPreselect.modeleId) {
        console.log('Debug - Chargement des matériels...');
        axios.get(`${API_URL}/api/materiels`, { 
          headers: { Authorization: `Bearer ${getToken()}` },
          params: {
            typeId: materielToPreselect.typeId,
            marqueId: materielToPreselect.marqueId,
            modeleId: materielToPreselect.modeleId
          }
        })
        .then(res => {
          const materiels = res.data.filter(m => !m.agentId); // Seulement les non affectés
          console.log('Debug - Matériels chargés:', materiels);
          setMateriels(materiels);
        })
        .catch(() => setError("Erreur lors du chargement des matériels"));
      }
    }
  }, [materielToPreselect, types]);

  // Effet séparé pour forcer la pré-sélection après un délai
  useEffect(() => {
    if (materielToPreselect && types.length > 0 && !preselectExecuted.current) {
      const timer = setTimeout(() => {
        console.log('Debug - Forçage de la pré-sélection après délai...');
        console.log('Debug - materielToPreselect.typeId:', materielToPreselect.typeId);
        console.log('Debug - types disponibles:', types);
        
        if (materielToPreselect.typeId) {
          console.log('Debug - Tentative de sélection du type:', materielToPreselect.typeId);
          setSelectedType(materielToPreselect.typeId);
          preselectExecuted.current = true;
          
          // Forcer la sélection via le DOM si nécessaire
          setTimeout(() => {
            const typeSelect = document.querySelector('select[value*="selectedType"]');
            if (typeSelect) {
              typeSelect.value = materielToPreselect.typeId;
              typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
              console.log('Debug - Sélection forcée via DOM');
            }
          }, 200);
        }
        if (materielToPreselect.marqueId) {
          setSelectedMarque(materielToPreselect.marqueId);
        }
        if (materielToPreselect.modeleId) {
          setSelectedModele(materielToPreselect.modeleId);
        }
        setSelectedMateriel(materielToPreselect.id.toString());
      }, 1500); // Délai de 1.5 secondes
      
      return () => clearTimeout(timer);
    }
  }, [materielToPreselect, types]);

  // Réinitialiser les sélections quand le type change
  useEffect(() => {
    if (!selectedType) {
      setSelectedMarque(null);
    }
    setSelectedModele(null);
    setMateriels([]);
    setSelectedMateriel('');
  }, [selectedType]);

  // Réinitialiser les modèles et matériels quand la marque change
  useEffect(() => {
    if (!selectedMarque) {
      setSelectedModele(null);
    }
    setMateriels([]);
    setSelectedMateriel('');
  }, [selectedMarque]);

  useEffect(() => {
    if (selectedModele) {
      axios.get(`${API_URL}/api/materiels`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(res => {
          // Filtrer les matériels non affectés et du modèle sélectionné
          const disponibles = Array.isArray(res.data)
            ? res.data.filter(m => m.modeleId === Number(selectedModele) && !m.agentId)
            : [];
          setMateriels(disponibles);
        })
        .catch(() => setMateriels([]));
    } else {
      setMateriels([]);
      setSelectedMateriel('');
    }
  }, [selectedModele]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!selectedAgent || !selectedMateriel) {
      setError('Veuillez sélectionner un agent et un matériel.');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/materiels/${selectedMateriel}/affecter/${selectedAgent}`,
  { dateAffectation: `${dateAffec.date}T00:00:00` },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSuccess('Affectation réussie !');
      setError('');
      setSelectedType('');
      setSelectedMarque('');
      setSelectedModele('');
      setSelectedMateriel('');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'affectation.");
      setSuccess('');
    }
    setLoading(false);
  };

  return (
    <CardLayout
      title="Affecter un Matériel à un Utilisateur"
      navTabs={navTabs}
      currentPath={location.pathname}
    >
      <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-white">
        {success && <Alert variant="success">{success}</Alert>}
        {displayError && <Alert variant="danger">{displayError}</Alert>}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Agent</Form.Label>
              <Typeahead
                id="agent-typeahead"
                labelKey={option => `${option.nom} ${option.username}`}
                options={agents}
                placeholder="Rechercher un agent..."
                onChange={selected => setSelectedAgent(selected[0]?.id || '')}
                selected={agents.filter(a => a.id === selectedAgent)}
                minLength={1}
                highlightOnlyResult
                clearButton
                renderMenuItemChildren={(option) => (
                  <span>{option.nom} {option.username}</span>
                )}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select value={selectedType || ''} onChange={e => setSelectedType(e.target.value ? Number(e.target.value) : null)} required>
                <option value="">Sélectionner un type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Marque</Form.Label>
              <Form.Select value={selectedMarque || ''} onChange={e => setSelectedMarque(e.target.value ? Number(e.target.value) : null)} required disabled={!selectedType}>
                <option value="">Sélectionner une marque</option>
                {marques.map(marque => (
                  <option key={marque.id} value={marque.id}>{marque.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Modèle</Form.Label>
              <Form.Select value={selectedModele || ''} onChange={e => setSelectedModele(e.target.value ? Number(e.target.value) : null)} required disabled={!selectedMarque}>
                <option value="">Sélectionner un modèle</option>
                {modeles.map(modele => (
                  <option key={modele.id} value={modele.id}>{modele.nom}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Matériel (Numéro de série)</Form.Label>
              <Form.Select value={selectedMateriel} onChange={e => setSelectedMateriel(e.target.value)} required disabled={!selectedModele}>
                <option value="">Sélectionner un matériel</option>
                {materiels.length === 0 ? (
                  <option disabled>Aucun matériel disponible</option>
                ) : (
                  materiels.map(m => (
                    <option key={m.id} value={m.id}>{m.numeroSerie}</option>
                  ))
                )}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Date d'affectation</Form.Label>
              <div style={{ marginTop: "5px" }}>
                <TextField
                  type="date"
                  size="small"
                  value={dateAffec.date}
                  onChange={e => setDateAffec({ ...dateAffec, date: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      borderRadius: "0.375rem", // match Bootstrap form style
                    },
                    "& input": {
                      padding: "10px 12px",
                      fontSize: "0.95rem",
                    },
                  }}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant="primary" className="w-100" disabled={isLoading}>
          {isLoading ? <Spinner animation="border" size="sm" /> : "Affecter"}
        </Button>
      </Form>
    </CardLayout>
  );
};

export default AffectationMateriel; 
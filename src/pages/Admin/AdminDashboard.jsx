import React, { useEffect, useState } from "react";
import { Card, Row, Col, Container, Spinner, Alert } from "react-bootstrap";
import { getMateriels, getTypes, getMarques, getModeles } from "../../api/materiel";
import axios from "axios";
import { API_URL } from "../../api/auth";
import { getToken } from "../../utils/storage";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.register(ChartDataLabels);

const AdminDashboard = () => {
  const [materiels, setMateriels] = useState([]);
  const [articles, setArticles] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandes, setDemandes] = useState([]);
  const [affectTypeFilter, setAffectTypeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMateriels(),
      axios.get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      getTypes(),
      getMarques(),
      getModeles(),
      axios.get(`${API_URL}/api/agents`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/demandes`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ])
      .then(([matRes, artRes, typeRes, marqueRes, modeleRes, agentRes, demandeRes]) => {
        setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
        setArticles(Array.isArray(artRes.data) ? artRes.data : []);
        setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
        setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
        setModeles(Array.isArray(modeleRes.data) ? modeleRes.data : []);
        setAgents(Array.isArray(agentRes.data) ? agentRes.data : []);
        setDemandes(Array.isArray(demandeRes.data) ? demandeRes.data : []);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des statistiques");
        console.error('Dashboard error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculs pour les cards
  const assignedCount = materiels.filter(m => m.agentId).length;
  const availableCount = materiels.filter(m => !m.agentId).length;

  // Advanced stats
  // Assignments this month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const assignmentsThisMonth = materiels.filter(m => {
    if (!m.dateAffectation) return false;
    const d = new Date(m.dateAffectation);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // De-assignments this month (placeholder if not available)
  // If you have a dateDesaffectation field, use it. Otherwise, show 'Non disponible'.
  const desaffectationsThisMonth = materiels.filter(m => {
    if (!m.dateDesaffectation) return false;
    const d = new Date(m.dateDesaffectation);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Most active agent (by number of assigned materials)
  const agentAssignmentCounts = agents.map(agent => ({
    id: agent.id,
    nom: agent.nom,
    prenom: agent.prenom,
    count: materiels.filter(m => m.agentId === agent.id).length
  }));
  const mostActiveAgent = agentAssignmentCounts.reduce((max, a) => a.count > max.count ? a : max, { count: 0 });

  // Pie chart: materials by type
  const typeLabels = types.map(t => t.nom);
  const typeCounts = types.map(t => materiels.filter(m => m.typeMaterielId === t.id).length);
  const pieData = {
    labels: typeLabels,
    datasets: [{
      data: typeCounts,
      backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8", "#fd7e14", "#20c997"],
    }]
  };

  // Bar chart: materials per brand
  const marqueLabels = marques.map(m => m.nom);
  const marqueCounts = marques.map(mq => materiels.filter(m => m.marqueId === mq.id).length);
  const barData = {
    labels: marqueLabels,
    datasets: [{
      label: 'Matériels par marque',
      data: marqueCounts,
      backgroundColor: '#007bff',
    }]
  };

  // Pie chart: matériels affectés/disponibles (filtré par type)
  const filteredMateriels = affectTypeFilter === 'all'
    ? materiels
    : materiels.filter(m => m.typeMaterielId === Number(affectTypeFilter));
  const filteredAssigned = filteredMateriels.filter(m => m.agentId).length;
  const filteredAvailable = filteredMateriels.filter(m => !m.agentId).length;
  const doughnutData = {
    labels: ["Affectés", "Disponibles"],
    datasets: [{ data: [filteredAssigned, filteredAvailable], backgroundColor: ["#28a745", "#ffc107"] }]
  };

  // Demandes stats
  const totalDemandes = demandes.length;
  const demandesThisMonth = demandes.filter(d => {
    const dDate = new Date(d.date);
    return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
  }).length;
  const validatedDemandes = demandes.filter(d => d.validation).length;
  const nonValidatedDemandes = demandes.filter(d => !d.validation).length;
  const demandesPieData = {
    labels: ["Validées", "Non validées"],
    datasets: [{
      data: [validatedDemandes, nonValidatedDemandes],
      backgroundColor: ["#28a745", "#dc3545"]
    }]
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Tableau de bord - Statistiques</h2>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card bg="primary" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/materiels'}>
                <Card.Body>
                  <Card.Title>Total Matériels</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{materiels.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="success" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/articles'}>
                <Card.Body>
                  <Card.Title>Total Articles</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{articles.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="info" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/types'}>
                <Card.Body>
                  <Card.Title>Total Types</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{types.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="secondary" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/marques'}>
                <Card.Body>
                  <Card.Title>Total Marques</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{marques.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="warning" text="dark" className="h-100 clickable-card" onClick={() => window.location.href='/modeles'}>
                <Card.Body>
                  <Card.Title>Total Modèles</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{modeles.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="dark" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/affectations-liste'}>
                <Card.Body>
                  <Card.Title>Matériels Affectés</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{assignedCount}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="light" text="dark" className="h-100 clickable-card" onClick={() => window.location.href='/materiels'}>
                <Card.Body>
                  <Card.Title>Matériels Disponibles</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{availableCount}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="primary" text="white" className="h-100 clickable-card" onClick={() => window.location.href='/profile'}>
                <Card.Body>
                  <Card.Title>Total Agents</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{agents.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Advanced stats row */}
          <Row className="mb-4">
            <Col md={6} className="mb-3">
              <Card bg="info" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Affectations ce mois</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{assignmentsThisMonth}</Card.Text>
                  <div>Nombre de matériels affectés ce mois-ci</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-3">
              <Card bg="secondary" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Agent le plus actif</Card.Title>
                  <Card.Text style={{ fontSize: 24 }}>
                    {mostActiveAgent && mostActiveAgent.count > 0
                      ? `${mostActiveAgent.nom || ''} ${mostActiveAgent.prenom || ''}`
                      : 'Aucun'}
                  </Card.Text>
                  <div>{mostActiveAgent && mostActiveAgent.count > 0 ? `${mostActiveAgent.count} matériels affectés` : 'Pas d’affectations'}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Demandes stats row */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card bg="info" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Total Demandes</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{totalDemandes}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="primary" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Demandes ce mois</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{demandesThisMonth}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="success" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Demandes validées</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{validatedDemandes}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card bg="danger" text="white" className="h-100">
                <Card.Body>
                  <Card.Title>Demandes non validées</Card.Title>
                  <Card.Text style={{ fontSize: 32 }}>{nonValidatedDemandes}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Charts: group material management charts first, then article/demande charts */}
          <Row className="mb-4">
            <Col md={4} className="mb-4">
              <Card className="h-100"><Card.Body><Card.Title>Répartition par Type</Card.Title>
                <Pie
                  data={pieData}
                  options={{
                    plugins: {
                      datalabels: {
                        display: (context) => context.dataset.data[context.dataIndex] !== 0,
                        color: '#222',
                        font: { weight: 'bold', size: 20 },
                        formatter: (value) => value,
                        anchor: 'center',
                        align: 'center',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        padding: 6
                      }
                    }
                  }}
                />
              </Card.Body></Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100"><Card.Body><Card.Title>Matériels par Marque</Card.Title>
                <Bar
                  data={barData}
                  options={{
                    plugins: {
                      datalabels: {
                        display: (context) => context.dataset.data[context.dataIndex] !== 0,
                        color: '#222',
                        font: { weight: 'bold', size: 18 },
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => value,
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        borderRadius: 4,
                        padding: 6
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                  }}
                />
              </Card.Body></Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100"><Card.Body><Card.Title>Affectés vs Disponibles</Card.Title>
                <div className="mb-2" style={{ maxWidth: 300, margin: '0 auto' }}>
                  <select className="form-select" value={affectTypeFilter} onChange={e => setAffectTypeFilter(e.target.value)}>
                    <option value="all">Tous les types</option>
                    {types.map(t => (
                      <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                  </select>
                </div>
                <Doughnut
                  data={doughnutData}
                  options={{
                    plugins: {
                      legend: { display: true, labels: { font: { size: 16 } } },
                      datalabels: {
                        color: '#222',
                        font: { weight: 'bold', size: 18 },
                        formatter: (value) => value,
                        anchor: 'center',
                        align: 'center'
                      }
                    }
                  }}
                />
              </Card.Body></Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Répartition des Demandes</Card.Title>
                  <Pie
                    data={demandesPieData}
                    options={{
                      plugins: {
                        datalabels: {
                          display: (context) => context.dataset.data[context.dataIndex] !== 0,
                          color: '#222',
                          font: { weight: 'bold', size: 20 },
                          formatter: (value) => value,
                          anchor: 'center',
                          align: 'center',
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          padding: 6
                        }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tables for recent and low stock */}
          <Row className="mb-4">
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>5 Matériels les plus récents</Card.Title>
                  <div style={{overflowX: 'auto'}}>
                  <table className="table table-sm table-striped align-middle" style={{minWidth: 500}}>
                    <thead>
                      <tr>
                        <th style={{whiteSpace: 'nowrap'}}>Numéro de Série</th>
                        <th style={{whiteSpace: 'nowrap'}}>Type</th>
                        <th style={{whiteSpace: 'nowrap'}}>Marque</th>
                        <th style={{whiteSpace: 'nowrap'}}>Modèle</th>
                        <th style={{whiteSpace: 'nowrap'}}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiels.slice(-5).reverse().map(m => {
                        const type = types.find(t => t.id === m.typeMaterielId)?.nom || '-';
                        const marque = marques.find(ma => ma.id === m.marqueId)?.nom || '-';
                        const modele = modeles.find(mo => mo.id === m.modeleId)?.nom || '-';
                        const statut = m.agentId ? 'Affecté' : 'Disponible';
                        return (
                          <tr key={m.id}>
                            <td style={{maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={m.numeroSerie}>{m.numeroSerie}</td>
                            <td style={{maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={type}>{type}</td>
                            <td style={{maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={marque}>{marque}</td>
                            <td style={{maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={modele}>{modele}</td>
                            <td>
                              {statut === 'Affecté' ? (
                                <span className="badge bg-success">Affecté</span>
                              ) : (
                                <span className="badge bg-warning text-dark">Disponible</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>5 Articles les plus récents</Card.Title>
                  <table className="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Désignation</th>
                        <th>Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.slice(-5).reverse().map(a => (
                        <tr key={a.id}>
                          <td>{a.code}</td>
                          <td>{a.designation}</td>
                          <td>{a.qte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>5 Articles avec la plus faible quantité</Card.Title>
                  <table className="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Désignation</th>
                        <th>Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...articles].sort((a, b) => a.qte - b.qte).slice(0, 5).map(a => (
                        <tr key={a.id}>
                          <td>{a.code}</td>
                          <td>{a.designation}</td>
                          <td>{a.qte}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard; 
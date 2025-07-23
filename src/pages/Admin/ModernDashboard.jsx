import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { getMateriels, getTypes, getMarques } from "../../api/materiel";
import axios from "axios";
import { API_URL } from "../../api/auth";
import { getToken } from "../../utils/storage";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ModernDashboard = () => {
  const [materiels, setMateriels] = useState([]);
  const [types, setTypes] = useState([]);
  const [marques, setMarques] = useState([]);
  const [articles, setArticles] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [affectTypeFilter, setAffectTypeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMateriels(),
      getTypes(),
      getMarques(),
      axios.get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      axios.get(`${API_URL}/api/demandes`, { headers: { Authorization: `Bearer ${getToken()}` } })
    ])
      .then(([matRes, typeRes, marqueRes, artRes, demandeRes]) => {
        setMateriels(Array.isArray(matRes.data) ? matRes.data : []);
        setTypes(Array.isArray(typeRes.data) ? typeRes.data : []);
        setMarques(Array.isArray(marqueRes.data) ? marqueRes.data : []);
        setArticles(Array.isArray(artRes.data) ? artRes.data : []);
        setDemandes(Array.isArray(demandeRes.data) ? demandeRes.data : []);
      })
      .catch((err) => {
        setError("Erreur lors du chargement des statistiques");
        console.error('ModernDashboard error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Stats matériels
  const totalMateriels = materiels.length;
  const assignedCount = materiels.filter(m => m.agentId).length;
  const availableCount = materiels.filter(m => !m.agentId).length;

  // Pie chart: répartition par type
  const typeLabels = types.map(t => t.nom);
  const typeCounts = types.map(t => materiels.filter(m => m.typeMaterielId === t.id).length);
  const pieData = {
    labels: typeLabels,
    datasets: [{ data: typeCounts, backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#17a2b8", "#fd7e14", "#20c997"] }]
  };

  // Bar chart: matériels par marque
  const marqueLabels = marques.map(m => m.nom);
  const marqueCounts = marques.map(mq => materiels.filter(m => m.marqueId === mq.id).length);
  const barData = {
    labels: marqueLabels,
    datasets: [{ label: 'Matériels', data: marqueCounts, backgroundColor: '#007bff' }]
  };

  // Stats demandes
  const totalDemandes = demandes.length;
  const validatedDemandes = demandes.filter(d => d.validation).length;
  const nonValidatedDemandes = demandes.filter(d => !d.validation).length;
  const demandesPieData = {
    labels: ["Validées", "Non validées"],
    datasets: [{ data: [validatedDemandes, nonValidatedDemandes], backgroundColor: ["#28a745", "#dc3545"] }]
  };

  // Alertes (exemple: stock faible < 5)
  const lowStockArticles = articles.filter(a => a.qte !== undefined && a.qte < 5);
  const pendingDemandes = demandes.filter(d => !d.validation);

  // Example: Pie chart for articles by stock level
  const stockLevelPieData = {
    labels: ["Stock faible (<5)", "Stock moyen (5-20)", "Stock élevé (>20)"],
    datasets: [{
      data: [
        articles.filter(a => a.qte !== undefined && a.qte < 5).length,
        articles.filter(a => a.qte !== undefined && a.qte >= 5 && a.qte <= 20).length,
        articles.filter(a => a.qte !== undefined && a.qte > 20).length
      ],
      backgroundColor: ["#dc3545", "#ffc107", "#28a745"]
    }]
  };

  // Bar chart: matériels par type
  const barTypeData = {
    labels: typeLabels,
    datasets: [{ label: 'Matériels par type', data: typeCounts, backgroundColor: '#1976d2' }]
  };

  // Pie chart: matériels affectés/disponibles (filtré par type)
  const filteredMateriels = affectTypeFilter === 'all'
    ? materiels
    : materiels.filter(m => m.typeMaterielId === Number(affectTypeFilter));
  const filteredAssigned = filteredMateriels.filter(m => m.agentId).length;
  const filteredAvailable = filteredMateriels.filter(m => !m.agentId).length;
  const affectPieData = {
    labels: ["Affectés", "Disponibles"],
    datasets: [{ data: [filteredAssigned, filteredAvailable], backgroundColor: ["#28a745", "#ffc107"] }]
  };

  // Bar chart: demandes par mois (12 derniers mois)
  const now = new Date();
  const months = Array.from({length: 12}, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
  const demandesByMonth = Array(12).fill(0);
  demandes.forEach(d => {
    const dDate = new Date(d.date);
    const diff = (dDate.getFullYear() - now.getFullYear()) * 12 + (dDate.getMonth() - now.getMonth()) + 11;
    if (diff >= 0 && diff < 12) demandesByMonth[diff]++;
  });
  const demandesMonthBarData = {
    labels: months,
    datasets: [{ label: 'Demandes', data: demandesByMonth, backgroundColor: '#8e24aa' }]
  };

  if (loading) return <Container className="mt-4 text-center"><Spinner animation="border" /></Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <div>
      <h2 className="mb-4">Tableau de bord moderne</h2>
      {/* Section Gestion Matériel */}
      <h4 className="mb-3">Gestion Matériel</h4>
      <Row className="mb-3">
        <Col md={3} className="mb-3">
          <Card bg="primary" text="white" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="box">📦</span> Total Matériels</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{totalMateriels}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card bg="success" text="white" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="check">✅</span> Affectés</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{assignedCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card bg="warning" text="dark" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="available">🟡</span> Disponibles</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{availableCount}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="chart">📊</span> Par Type/Marque</Card.Title>
              <div style={{ width: 180, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                <Pie data={pieData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Section Demandes */}
      <h4 className="mb-3 mt-5">Demandes</h4>
      <Row className="mb-3">
        <Col md={3} className="mb-3">
          <Card bg="info" text="white" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="note">📝</span> Total Demandes</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{totalDemandes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card bg="success" text="white" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="valid">✔️</span> Validées</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{validatedDemandes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card bg="danger" text="white" className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="invalid">❌</span> Non validées</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{nonValidatedDemandes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title><span role="img" aria-label="chart">📊</span> Validées/Non validées</Card.Title>
              <div style={{ width: 180, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                <Pie data={demandesPieData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Section Alertes */}
      <h4 className="mb-3 mt-5">Alertes</h4>
      <Row className="mb-3">
        <Col md={6} className="mb-3">
          <Card className="h-100 text-center shadow-sm" style={{ borderLeft: '6px solid #dc3545', background: '#fff6f6', borderRadius: 16 }}>
            <Card.Body>
              <div style={{ fontSize: 36, color: '#dc3545', marginBottom: 8 }}>⚠️</div>
              <Card.Title style={{ fontWeight: 700, color: '#dc3545', fontSize: 22 }}>Stock faible</Card.Title>
              <div className="d-flex flex-wrap justify-content-center mt-3">
                {lowStockArticles.length === 0 ? (
                  <Badge bg="success" className="p-2 px-3 rounded-pill shadow-sm" style={{ fontSize: 16 }}>Aucun article en stock faible</Badge>
                ) : (
                  lowStockArticles.map(a => (
                    <Badge key={a.id} style={{ background: '#dc3545', color: '#fff', margin: 6, fontSize: 16, borderRadius: 20, padding: '10px 18px', boxShadow: '0 2px 6px #f8d7da', fontWeight: 500 }}>
                      {a.designation} ({a.qte})
                    </Badge>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-3">
          <Card className="h-100 text-center shadow-sm" style={{ borderLeft: '6px solid #ffc107', background: '#fffbe6', borderRadius: 16 }}>
            <Card.Body>
              <div style={{ fontSize: 36, color: '#ffc107', marginBottom: 8 }}>⏳</div>
              <Card.Title style={{ fontWeight: 700, color: '#ffc107', fontSize: 22 }}>Demandes en attente</Card.Title>
              <div className="d-flex flex-wrap justify-content-center mt-3">
                {pendingDemandes.length === 0 ? (
                  <Badge bg="success" className="p-2 px-3 rounded-pill shadow-sm" style={{ fontSize: 16 }}>Aucune demande en attente</Badge>
                ) : (
                  pendingDemandes.map(d => (
                    <Badge key={d.id} style={{ background: '#ffc107', color: '#222', margin: 6, fontSize: 16, borderRadius: 20, padding: '10px 18px', boxShadow: '0 2px 6px #fff3cd', fontWeight: 500 }}>
                      Demande #{d.id}
                    </Badge>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Voir plus de stats */}
      {showMore && (
        <div className="mt-4">
          <h4 className="mb-3">Statistiques avancées</h4>
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>Matériels par Marque</Card.Title>
                  <Bar data={barData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>Articles par niveau de stock</Card.Title>
                  <div style={{ width: 180, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                    <Pie data={stockLevelPieData} options={{ maintainAspectRatio: false }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>Matériels par Type</Card.Title>
                  <Bar data={barTypeData} />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>Répartition Affectés/Disponibles</Card.Title>
                  <div className="mb-2" style={{ maxWidth: 300, margin: '0 auto' }}>
                    <select className="form-select" value={affectTypeFilter} onChange={e => setAffectTypeFilter(e.target.value)}>
                      <option value="all">Tous les types</option>
                      {types.map(t => (
                        <option key={t.id} value={t.id}>{t.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ width: 180, height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                    <Pie data={affectPieData} options={{ maintainAspectRatio: false }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={12} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <Card.Title>Demandes par Mois (12 derniers mois)</Card.Title>
                  <Bar data={demandesMonthBarData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
      {/* Voir plus de stats : EN BAS */}
      <div className="text-center mt-4 mb-5">
        <Button variant="outline-secondary" size="lg" onClick={() => setShowMore(v => !v)}>
          {showMore ? "Masquer les statistiques avancées" : "Voir plus de statistiques"}
        </Button>
      </div>
    </div>
  );
};

export default ModernDashboard; 
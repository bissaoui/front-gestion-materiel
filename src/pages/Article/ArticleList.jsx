import React, { useState, useEffect } from "react";
import { Table, Form, Button, Container, Pagination, Row, Col, Modal } from "react-bootstrap";

import axios from "axios";
import { getToken } from "../../utils/storage";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import  {API_URL}  from "../../api/auth";
import { useNavigate } from "react-router-dom";

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [setShowModalUp, setShowModalup] = useState(false);
  const [setShowModalDel, setShowModaldel] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [editingArticle, setEditingArticle] = useState({ id: null, code: "", designation: "", unite: "", qte: "" });
  const navigate = useNavigate();

  const fetchArticles = () => {
    axios
      .get(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((response) => setArticles(response.data))
      .catch((error) => console.error("Erreur:", error));
  };

  useEffect(() => {
    fetchArticles();
},[]);

  const handleSearch = (event) => {
    setSearch(event.target.value.toLowerCase());
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };
  const handleEditClick = (article) => {
    setEditingArticle(article);
    setShowModalup(true);
  };
  const handleChange = (e) => {
    setEditingArticle({ ...editingArticle, [e.target.name]: e.target.value });
  };
  const handleUpdate = () => {
    axios
      .put(`${API_URL}/api/articles/${editingArticle.id}`, editingArticle, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then(() => {
        fetchArticles();
        setArticles(articles.map((article) => (article.id === editingArticle.id ? editingArticle : article)));
        setShowModalup(false);
      })
      .catch((error) => console.error("Erreur de mise à jour:", error));
  };

  const handleDelete = () => {
    console.log("Deleting article:", articleToDelete);
    if (!articleToDelete) return;
    axios.delete(`${API_URL}/api/articles/${articleToDelete}`,{
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(() => {
        fetchArticles();
        setArticles(articles.filter(article => article.code !== articleToDelete));
        setShowModaldel(false);
      })
      .catch(error => console.error("Erreur lors de la suppression:", error));
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (!sortField) return 0;
    return sortOrder === "asc" ? (a[sortField] > b[sortField] ? 1 : -1) : (a[sortField] < b[sortField] ? 1 : -1);
  });

  const filteredArticles = sortedArticles.filter((article) =>
    Object.values(article).some((value) => value.toString().toLowerCase().includes(search))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // return (
  //   <Container className="mt-4">
  //     <Row className="mb-3">
  //       <Col md={6}>
  //         <Form.Control type="text" placeholder="Rechercher..." onChange={handleSearch} />
  //       </Col>
  //       <Col md={6} className="text-end">
  //       <Button variant="primary" onClick={() => navigate("/articles/create")}>
  //         Ajouter un article
  //       </Button>
  //       </Col>
  //     </Row>
  //     <Table striped bordered hover responsive>
  //       <thead>
  //         <tr>
  //           {[
  //             { key: "code", label: "Code" },
  //             { key: "designation", label: "Désignation" },
  //             { key: "unite", label: "Unité" },
  //             { key: "qte", label: "Quantité" },
  //           ].map(({ key, label }) => (
  //             <th key={key} onClick={() => handleSort(key)}>
  //               {label}{" "}
  //               {sortField === key && (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
  //             </th>
  //           ))}
  //           <th>Actions</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {currentArticles.map((article) => (
  //           <tr key={article.id}>
  //             <td>{article.code}</td>
  //             <td>{article.designation}</td>
  //             <td>{article.unite}</td>
  //             <td>{article.qte}</td>
  //             <td>
  //               <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditClick(article)}>
  //                 Modifier
  //               </Button>
  //               <Button variant="danger" size="sm" onClick={() => { setShowModaldel(true); setArticleToDelete(article.id); }}>
  //                 Supprimer
  //               </Button>
  //             </td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </Table>
  //     <Row className="align-items-center">
  //       <Col md={6}>
  //         <Form.Select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
  //           {[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}</option>)}
  //         </Form.Select>
  //       </Col>
  //       <Col md={6} className="text-end">
  //         <Pagination>
  //           {[...Array(totalPages)].map((_, index) => (
  //             <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => setCurrentPage(index + 1)}>
  //               {index + 1}
  //             </Pagination.Item>
  //           ))}
  //         </Pagination>
  //       </Col>
  //     </Row>

  //     <Modal show={setShowModalDel} onHide={() => setShowModaldel(false)}>
  //       <Modal.Header closeButton>
  //         <Modal.Title>Confirmation</Modal.Title>
  //       </Modal.Header>
  //       <Modal.Body>Voulez-vous vraiment supprimer cet article ?</Modal.Body>
  //       <Modal.Footer>
  //         <Button variant="secondary" onClick={() => setShowModaldel(false)}>Annuler</Button>
  //         <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
  //       </Modal.Footer>
  //     </Modal>

  //      {/* Modal for Editing Article */}
  //      <Modal show={setShowModalUp} onHide={() => setShowModalup(false)}>
  //       <Modal.Header closeButton>
  //         <Modal.Title>Modifier l'article</Modal.Title>
  //       </Modal.Header>
  //       <Modal.Body>
  //         <Form>
  //           <Form.Group className="mb-3">
  //             <Form.Label>Code</Form.Label>
  //             <Form.Control type="text" name="code" value={editingArticle.code} onChange={handleChange} />
  //           </Form.Group>
  //           <Form.Group className="mb-3">
  //             <Form.Label>Désignation</Form.Label>
  //             <Form.Control type="text" name="designation" value={editingArticle.designation} onChange={handleChange} />
  //           </Form.Group>
  //           <Form.Group className="mb-3">
  //             <Form.Label>Unité</Form.Label>
  //             <Form.Control type="text" name="unite" value={editingArticle.unite} onChange={handleChange} />
  //           </Form.Group>
  //           <Form.Group className="mb-3">
  //             <Form.Label>Quantité</Form.Label>
  //             <Form.Control type="number" name="qte" value={editingArticle.qte} onChange={handleChange} />
  //           </Form.Group>
  //         </Form>
  //       </Modal.Body>
  //       <Modal.Footer>
  //         <Button variant="secondary" onClick={() => setShowModalup(false)}>Annuler</Button>
  //         <Button variant="primary" onClick={handleUpdate}>Enregistrer</Button>
  //       </Modal.Footer>
  //     </Modal>
  //   </Container>
  // );
  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Rechercher..."
            onChange={handleSearch}
            className="animated fadeIn"
          />
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={() => navigate("/articles/create")} className="animated fadeIn">
            Ajouter un article
          </Button>
        </Col>
      </Row>

      {/* Table for displaying articles */}
      <Table striped bordered hover responsive className="animated fadeIn">
        <thead>
          <tr>
            {[
              { key: "code", label: "Code" },
              { key: "designation", label: "Désignation" },
              { key: "unite", label: "Unité" },
              { key: "qte", label: "Quantité" },
            ].map(({ key, label }) => (
              <th key={key} onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
                {label}{" "}
                {sortField === key && (sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />)}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentArticles.map((article) => (
            <tr key={article.id}>
              <td>{article.code}</td>
              <td>{article.designation}</td>
              <td>{article.unite}</td>
              <td>{article.qte}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditClick(article)}>
                  Modifier
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setShowModaldel(true); setArticleToDelete(article.id); }}>
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination Controls */}
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <Form.Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="animated fadeIn"
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} par page
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
          <Pagination>
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </Col>
      </Row>

      {/* Delete Article Modal */}
      <Modal show={setShowModalDel} onHide={() => setShowModaldel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Voulez-vous vraiment supprimer cet article ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModaldel(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Article Modal */}
      <Modal show={setShowModalUp} onHide={() => setShowModalup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                type="text"
                name="code"
                value={editingArticle.code}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Désignation</Form.Label>
              <Form.Control
                type="text"
                name="designation"
                value={editingArticle.designation}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unité</Form.Label>
              <Form.Control
                type="text"
                name="unite"
                value={editingArticle.unite}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                name="qte"
                value={editingArticle.qte}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalup(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ArticleList;

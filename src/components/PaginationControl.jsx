import React from 'react';
import { Pagination, Form, Row, Col } from 'react-bootstrap';

const PaginationControl = ({ currentPage, totalPages, onPageChange, itemsPerPage, setItemsPerPage }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      pageNumbers.push(i);
    } else if (
      (i === currentPage - 3 && currentPage - 3 > 1) ||
      (i === currentPage + 3 && currentPage + 3 < totalPages)
    ) {
      pageNumbers.push('ellipsis-' + i);
    }
  }

  return (
    <Row className="align-items-center mt-3">
      <Col xs="auto">
        <Pagination>
          <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
          {pageNumbers.map((num, idx) =>
            typeof num === 'string' && num.startsWith('ellipsis') ? (
              <Pagination.Ellipsis key={num + idx} disabled />
            ) : (
              <Pagination.Item
                key={num}
                active={num === currentPage}
                onClick={() => onPageChange(num)}
              >
                {num}
              </Pagination.Item>
            )
          )}
          <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </Col>
      <Col xs="auto">
        <Form.Select
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
          style={{ width: 100 }}
        >
          {[10, 20, 50, 100].map(opt => (
            <option key={opt} value={opt}>{opt} / page</option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
};

export default PaginationControl; 
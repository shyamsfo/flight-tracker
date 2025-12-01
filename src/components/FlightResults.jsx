import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const FlightResults = ({ flights, searchTerm }) => {
  if (!searchTerm) {
    return null;
  }

  if (flights.length === 0) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="alert alert-info text-center">
              No flights found for "{searchTerm}". Try a different flight number.
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const variant = status === 'On Time' ? 'success' : status === 'Delayed' ? 'warning' : 'secondary';
    return <Badge bg={variant}>{status}</Badge>;
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h3 className="mb-4">Search Results ({flights.length} flight{flights.length !== 1 ? 's' : ''} found)</h3>

          {flights.map((flight) => (
            <Card key={flight.id} className="mb-3 flight-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="mb-1">{flight.flightNumber}</h4>
                    <p className="text-muted mb-0">{flight.airline}</p>
                  </div>
                  <div>
                    {getStatusBadge(flight.status)}
                  </div>
                </div>

                <Row className="flight-details">
                  <Col md={5}>
                    <div className="location-info">
                      <h5 className="location-label">Departure</h5>
                      <p className="location-name mb-1">{flight.departureLocation}</p>
                      <p className="time mb-1">{formatTime(flight.departureTime)}</p>
                      <p className="date mb-1">{formatDate(flight.departureTime)}</p>
                      <p className="timezone text-muted mb-0">{flight.departureTimezone}</p>
                    </div>
                  </Col>

                  <Col md={2} className="text-center d-flex align-items-center justify-content-center">
                    <div className="flight-arrow">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Col>

                  <Col md={5}>
                    <div className="location-info">
                      <h5 className="location-label">Arrival</h5>
                      <p className="location-name mb-1">{flight.arrivalLocation}</p>
                      <p className="time mb-1">{formatTime(flight.arrivalTime)}</p>
                      <p className="date mb-1">{formatDate(flight.arrivalTime)}</p>
                      <p className="timezone text-muted mb-0">{flight.arrivalTimezone}</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default FlightResults;

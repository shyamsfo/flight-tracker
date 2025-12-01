import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const FlightSearch = ({ onSearch, isLoading }) => {
  const [flightNumber, setFlightNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (flightNumber.trim()) {
      onSearch(flightNumber);
    }
  };

  return (
    <Container className="flight-search-container">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="search-container">
            <h1 className="text-center mb-4">Flight Tracker</h1>
            <p className="text-center text-muted mb-4">
              Search for your flight by entering the flight number
            </p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Flight Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., AA123, UA456, DL789"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  disabled={isLoading}
                  size="lg"
                />
                <Form.Text className="text-muted">
                  Enter airline code and flight number (e.g., AA123)
                </Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                size="lg"
                disabled={isLoading || !flightNumber.trim()}
              >
                {isLoading ? 'Searching...' : 'Search Flight'}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FlightSearch;

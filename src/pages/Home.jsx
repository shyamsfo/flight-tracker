import { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import FlightSearch from '../components/FlightSearch';
import FlightResults from '../components/FlightResults';
import { useAuth0 } from '../context/Auth0Context';
import api_utils from '../lib/api_utils';

const Home = () => {
  const { isAuthenticated, login, getAccessToken } = useAuth0();
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (flightNumber) => {
    setIsLoading(true);
    setSearchTerm(flightNumber);

    try {
      const token = await getAccessToken();
      const results = await api_utils.get_data(token, '/flights/search', { q: flightNumber });
      setFlights(results);
    } catch (error) {
      console.error('Error searching flights:', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="text-center shadow">
              <Card.Body className="py-5">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-3 text-muted"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <h4 className="mb-3">Login Required</h4>
                <p className="text-muted mb-4">
                  You need to be logged in to search flights.
                </p>
                <Button variant="primary" size="lg" onClick={login}>
                  Log In
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <>
      <FlightSearch onSearch={handleSearch} isLoading={isLoading} />
      {isLoading && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && <FlightResults flights={flights} searchTerm={searchTerm} />}
    </>
  );
};

export default Home;

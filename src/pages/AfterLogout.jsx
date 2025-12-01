import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './AfterLogout.css';

const AfterLogout = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="after-logout-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="logout-info-card">
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="logout-icon mb-3">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </div>
                  <h2 className="mb-2">Successfully Logged Out</h2>
                  <p className="text-muted mb-4">
                    You have been securely logged out of your account.
                  </p>
                </div>

                <div className="logout-message-section">
                  <div className="logout-message">
                    <p className="mb-3">
                      <strong>Thank you for using Flight Tracker!</strong>
                    </p>
                    <p className="text-muted mb-0">
                      Your session has been terminated and all authentication tokens have been cleared.
                      You can continue browsing as a guest or log in again to access personalized features.
                    </p>
                  </div>

                  <div className="text-center mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleReturnHome}
                      className="return-button"
                    >
                      Return to Flight Tracker
                    </Button>
                  </div>

                  <div className="security-note mt-4 text-center">
                    <small className="text-muted">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      For security, please close your browser if you're on a shared computer.
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AfterLogout;

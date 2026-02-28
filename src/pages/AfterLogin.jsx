import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button, Alert } from 'react-bootstrap';
import { useAuth0 } from '../context/Auth0Context';
import api_utils from '../lib/api_utils';
import './AfterLogin.css';

const AfterLogin = () => {
  const { isAuthenticated, user, isLoading, getAccessToken } = useAuth0();
  const navigate = useNavigate();
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // If not authenticated and not loading, redirect to home
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="after-login-container">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Completing login...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleContinue = () => {
    navigate('/');
  };

  const handleVerifyBackend = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const token = await getAccessToken();
      const data = await api_utils.get_data(token, '/verify');
      setVerifyResult(data);
    } catch (err) {
      setVerifyError(err.message || 'Backend verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="after-login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="user-info-card">
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="success-icon mb-3">
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h2 className="mb-2">Login Successful!</h2>
                  <p className="text-muted">Welcome to Flight Tracker</p>
                </div>

                <div className="user-profile-section">
                  <div className="text-center mb-4">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || 'User'}
                        className="user-profile-picture"
                      />
                    ) : (
                      <div className="user-profile-picture-placeholder">
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <h4 className="text-center mb-4">Your Profile Information</h4>

                  <div className="user-details">
                    {user.name && (
                      <div className="user-detail-item">
                        <strong>Name:</strong>
                        <span>{user.name}</span>
                      </div>
                    )}

                    {user.email && (
                      <div className="user-detail-item">
                        <strong>Email:</strong>
                        <span>{user.email}</span>
                      </div>
                    )}

                    {user.email_verified !== undefined && (
                      <div className="user-detail-item">
                        <strong>Email Verified:</strong>
                        <span>
                          {user.email_verified ? (
                            <span className="badge bg-success">Verified</span>
                          ) : (
                            <span className="badge bg-warning">Not Verified</span>
                          )}
                        </span>
                      </div>
                    )}

                    {user.nickname && (
                      <div className="user-detail-item">
                        <strong>Nickname:</strong>
                        <span>{user.nickname}</span>
                      </div>
                    )}

                    {user.updated_at && (
                      <div className="user-detail-item">
                        <strong>Last Updated:</strong>
                        <span>{new Date(user.updated_at).toLocaleString()}</span>
                      </div>
                    )}

                    {user.sub && (
                      <div className="user-detail-item">
                        <strong>User ID:</strong>
                        <span className="user-id">{user.sub}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-4 d-flex justify-content-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleContinue}
                      className="continue-button"
                    >
                      Continue to Flight Tracker
                    </Button>
                    <Button
                      variant="outline-success"
                      size="lg"
                      onClick={handleVerifyBackend}
                      disabled={verifying}
                    >
                      {verifying ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Backend'
                      )}
                    </Button>
                  </div>

                  {verifyResult && (
                    <Alert variant="success" className="mt-3" dismissible onClose={() => setVerifyResult(null)}>
                      <Alert.Heading>Backend Verified</Alert.Heading>
                      <div className="user-details mb-3">
                        {verifyResult.user?.picture && (
                          <div className="text-center mb-2">
                            <img
                              src={verifyResult.user.picture}
                              alt={verifyResult.user.name || 'User'}
                              style={{ width: 48, height: 48, borderRadius: '50%' }}
                            />
                          </div>
                        )}
                        {verifyResult.user?.name && (
                          <p className="mb-1"><strong>Name:</strong> {verifyResult.user.name}</p>
                        )}
                        {verifyResult.user?.email && (
                          <p className="mb-1"><strong>Email:</strong> {verifyResult.user.email}</p>
                        )}
                        {verifyResult.user?.nickname && (
                          <p className="mb-1"><strong>Nickname:</strong> {verifyResult.user.nickname}</p>
                        )}
                        {verifyResult.user?.email_verified !== undefined && (
                          <p className="mb-1">
                            <strong>Email Verified:</strong>{' '}
                            <span className={`badge bg-${verifyResult.user.email_verified ? 'success' : 'warning'}`}>
                              {verifyResult.user.email_verified ? 'Yes' : 'No'}
                            </span>
                          </p>
                        )}
                        <p className="mb-1"><strong>Sub:</strong> {verifyResult.claims?.sub}</p>
                      </div>
                      <hr />
                      <details>
                        <summary className="mb-2" style={{ cursor: 'pointer' }}>Raw token claims & user info</summary>
                        <pre className="mb-0" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify({ claims: verifyResult.claims, user: verifyResult.user }, null, 2)}
                        </pre>
                      </details>
                    </Alert>
                  )}

                  {verifyError && (
                    <Alert variant="danger" className="mt-3" dismissible onClose={() => setVerifyError(null)}>
                      <Alert.Heading>Verification Failed</Alert.Heading>
                      <p>{verifyError}</p>
                    </Alert>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AfterLogin;

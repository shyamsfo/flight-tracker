import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button, Alert } from 'react-bootstrap';
import { useAuth0 } from '../context/Auth0Context';
import api_utils from '../lib/api_utils';
import './UserInfo.css';

const UserInfo = () => {
  const { isAuthenticated, user, isLoading, getAccessToken } = useAuth0();
  const navigate = useNavigate();
  const [backendData, setBackendData] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleVerifyBackend = async () => {
    setVerifying(true);
    setBackendData(null);
    setBackendError(null);
    try {
      const token = await getAccessToken();
      const data = await api_utils.get_data(token, '/verify');
      setBackendData(data);
    } catch (err) {
      setBackendError(err.message || 'Backend verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="userinfo-container">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading user info...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const DetailItem = ({ label, value }) => (
    <div className="userinfo-detail-item">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );

  return (
    <div className="userinfo-container">
      <Container>
        <h2 className="userinfo-title text-center mb-4">User Information</h2>
        <Row className="justify-content-center g-4">
          {/* Frontend Card */}
          <Col md={6}>
            <Card className="userinfo-card h-100">
              <Card.Header className="userinfo-card-header frontend-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span>Frontend (Auth0 SDK)</span>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name || 'User'} className="userinfo-avatar" />
                  ) : (
                    <div className="userinfo-avatar-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="userinfo-details">
                  {user.name && <DetailItem label="Name" value={user.name} />}
                  {user.email && <DetailItem label="Email" value={user.email} />}
                  {user.email_verified !== undefined && (
                    <DetailItem
                      label="Email Verified"
                      value={
                        <span className={`badge bg-${user.email_verified ? 'success' : 'warning'}`}>
                          {user.email_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      }
                    />
                  )}
                  {user.nickname && <DetailItem label="Nickname" value={user.nickname} />}
                  {user.updated_at && <DetailItem label="Last Updated" value={new Date(user.updated_at).toLocaleString()} />}
                  {user.sub && <DetailItem label="User ID" value={<span className="userinfo-mono">{user.sub}</span>} />}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Backend Card */}
          <Col md={6}>
            <Card className="userinfo-card h-100">
              <Card.Header className="userinfo-card-header backend-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <span>Backend (JWT Verification)</span>
              </Card.Header>
              <Card.Body>
                {!backendData && !backendError && (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">
                      Verify your token against the Flask backend to see server-side user info and JWT claims.
                    </p>
                    <Button
                      variant="outline-success"
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
                )}

                {backendError && (
                  <Alert variant="danger" dismissible onClose={() => setBackendError(null)}>
                    <Alert.Heading>Verification Failed</Alert.Heading>
                    <p className="mb-2">{backendError}</p>
                    <Button variant="outline-danger" size="sm" onClick={handleVerifyBackend} disabled={verifying}>
                      Retry
                    </Button>
                  </Alert>
                )}

                {backendData && (
                  <>
                    {backendData.user && (
                      <>
                        <h6 className="mb-3">User Profile (from Auth0 /userinfo)</h6>
                        <div className="text-center mb-3">
                          {backendData.user.picture && (
                            <img src={backendData.user.picture} alt={backendData.user.name || 'User'} className="userinfo-avatar-sm" />
                          )}
                        </div>
                        <div className="userinfo-details mb-3">
                          {backendData.user.name && <DetailItem label="Name" value={backendData.user.name} />}
                          {backendData.user.email && <DetailItem label="Email" value={backendData.user.email} />}
                          {backendData.user.email_verified !== undefined && (
                            <DetailItem
                              label="Email Verified"
                              value={
                                <span className={`badge bg-${backendData.user.email_verified ? 'success' : 'warning'}`}>
                                  {backendData.user.email_verified ? 'Verified' : 'Not Verified'}
                                </span>
                              }
                            />
                          )}
                          {backendData.user.nickname && <DetailItem label="Nickname" value={backendData.user.nickname} />}
                          {backendData.user.sub && <DetailItem label="Sub" value={<span className="userinfo-mono">{backendData.user.sub}</span>} />}
                        </div>
                      </>
                    )}

                    <h6 className="mb-3">JWT Claims</h6>
                    <div className="userinfo-details mb-3">
                      {backendData.claims?.sub && <DetailItem label="Sub" value={<span className="userinfo-mono">{backendData.claims.sub}</span>} />}
                      {backendData.claims?.aud && (
                        <DetailItem label="Audience" value={<span className="userinfo-mono">{Array.isArray(backendData.claims.aud) ? backendData.claims.aud.join(', ') : backendData.claims.aud}</span>} />
                      )}
                      {backendData.claims?.iss && <DetailItem label="Issuer" value={<span className="userinfo-mono">{backendData.claims.iss}</span>} />}
                      {backendData.claims?.exp && <DetailItem label="Expires" value={new Date(backendData.claims.exp * 1000).toLocaleString()} />}
                      {backendData.claims?.iat && <DetailItem label="Issued At" value={new Date(backendData.claims.iat * 1000).toLocaleString()} />}
                    </div>

                    <details>
                      <summary className="mb-2" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>Raw JSON</summary>
                      <pre className="userinfo-raw-json">
                        {JSON.stringify(backendData, null, 2)}
                      </pre>
                    </details>

                    <div className="text-center mt-3">
                      <Button variant="outline-success" size="sm" onClick={handleVerifyBackend} disabled={verifying}>
                        {verifying ? 'Verifying...' : 'Re-verify'}
                      </Button>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserInfo;

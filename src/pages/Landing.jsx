import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Landing.css';

const Landing = () => {
  const applications = [
    {
      id: 'flights',
      name: 'Flight Tracker',
      path: '/flights',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      ),
      description: 'Search and track flights worldwide with real-time information',
      color: '#667eea'
    },
    {
      id: 'mindmap',
      name: 'DeepStore Explorer',
      path: '/mindmap',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <line x1="8" y1="6" x2="10" y2="10" />
          <line x1="16" y1="6" x2="14" y2="10" />
          <line x1="8" y1="18" x2="10" y2="14" />
          <line x1="16" y1="18" x2="14" y2="14" />
        </svg>
      ),
      description: 'Explore knowledge through a non-linear network of questions and answers',
      color: '#10b981'
    }
  ];

  return (
    <div className="landing-container">
      <Container>
        <div className="landing-hero">
          <h1 className="landing-title">Application Showcase</h1>
          <p className="landing-subtitle">
            Welcome to our multi-application platform. Choose from our collection of powerful tools and services.
          </p>
        </div>

        <Row className="justify-content-center mt-5">
          <Col md={10} lg={8}>
            <div className="landing-instructions">
              <div className="landing-instructions-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
              <div className="landing-instructions-text">
                <strong>Quick Tip:</strong> Use the menu icon in the top left corner to access all available applications at any time.
              </div>
            </div>

            <h2 className="landing-section-title">Available Applications</h2>

            <div className="landing-apps-grid">
              {applications.map((app) => (
                <Card key={app.id} className="landing-app-card">
                  <Card.Body>
                    <div className="landing-app-icon" style={{ background: `linear-gradient(135deg, ${app.color} 0%, ${app.color}dd 100%)` }}>
                      {app.icon}
                    </div>
                    <h3 className="landing-app-title">{app.name}</h3>
                    <p className="landing-app-description">{app.description}</p>
                    <Link to={app.path}>
                      <Button variant="primary" className="landing-app-button">
                        Launch Application
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Button>
                    </Link>
                  </Card.Body>
                </Card>
              ))}
            </div>

            <div className="landing-coming-soon">
              <div className="landing-coming-soon-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3>More Applications Coming Soon</h3>
              <p>We're constantly working on adding new tools and services to enhance your experience.</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Landing;

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
    },
    {
      id: 'bmi',
      name: 'BMI Calculator',
      path: '/bmi',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      description: 'Calculate your Body Mass Index with support for metric and imperial units',
      color: '#f59e0b'
    },
    {
      id: 'heartrate',
      name: 'Heart Rate Zones',
      path: '/heartrate',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      description: 'Determine your optimal heart rate training zones based on age and gender',
      color: '#ef4444'
    },
    {
      id: 'csv',
      name: 'CSV Viewer',
      path: '/csv',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      ),
      description: 'View and analyze CSV files with powerful grid features and filtering',
      color: '#16a34a'
    },
    {
      id: 'coinflip',
      name: 'Coin Flipper',
      path: '/coinflip',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
        </svg>
      ),
      description: 'Simulate coin flips and visualize the probability distribution over time',
      color: '#fbbf24'
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      path: '/kanban',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      description: 'Organize and manage tasks with customizable columns and drag-and-drop',
      color: '#8b5cf6'
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

import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import './HeartRateCalculator.css';

const HeartRateCalculator = () => {
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [maxHeartRate, setMaxHeartRate] = useState(null);
  const [zones, setZones] = useState(null);

  const calculateHeartRate = (e) => {
    e.preventDefault();

    if (!gender || !age) {
      return;
    }

    const ageNum = parseInt(age);

    // Calculate max heart rate based on gender
    let maxHR;
    if (gender === 'male') {
      maxHR = 220 - ageNum;
    } else if (gender === 'female') {
      maxHR = 226 - ageNum;
    } else {
      // For 'other', use average of both formulas
      maxHR = 223 - ageNum;
    }

    setMaxHeartRate(maxHR);

    // Calculate heart rate zones
    const calculatedZones = [
      {
        zone: 'Zone 1',
        name: 'Recovery',
        description: 'Very Light',
        percentage: '50-60%',
        min: Math.round(maxHR * 0.50),
        max: Math.round(maxHR * 0.60),
        color: 'info'
      },
      {
        zone: 'Zone 2',
        name: 'Endurance',
        description: 'Light',
        percentage: '60-70%',
        min: Math.round(maxHR * 0.60),
        max: Math.round(maxHR * 0.70),
        color: 'success'
      },
      {
        zone: 'Zone 3',
        name: 'Aerobic',
        description: 'Moderate',
        percentage: '70-80%',
        min: Math.round(maxHR * 0.70),
        max: Math.round(maxHR * 0.80),
        color: 'primary'
      },
      {
        zone: 'Zone 4',
        name: 'Anaerobic',
        description: 'Hard',
        percentage: '80-90%',
        min: Math.round(maxHR * 0.80),
        max: Math.round(maxHR * 0.90),
        color: 'warning'
      },
      {
        zone: 'Zone 5',
        name: 'Maximum',
        description: 'Maximum Effort',
        percentage: '90-100%',
        min: Math.round(maxHR * 0.90),
        max: Math.round(maxHR * 1.00),
        color: 'danger'
      }
    ];

    setZones(calculatedZones);
  };

  const resetForm = () => {
    setGender('');
    setAge('');
    setMaxHeartRate(null);
    setZones(null);
  };

  return (
    <div className="heart-rate-calculator-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-danger text-white">
                <h2 className="mb-0 text-center">Heart Rate Zone Calculator</h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={calculateHeartRate}>
                  <Row>
                    {/* Gender Selection */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Gender</Form.Label>
                        <div className="d-flex flex-column gap-2">
                          <Form.Check
                            type="radio"
                            label="Male (220 - age)"
                            name="gender"
                            id="gender-male"
                            value="male"
                            checked={gender === 'male'}
                            onChange={(e) => setGender(e.target.value)}
                          />
                          <Form.Check
                            type="radio"
                            label="Female (226 - age)"
                            name="gender"
                            id="gender-female"
                            value="female"
                            checked={gender === 'female'}
                            onChange={(e) => setGender(e.target.value)}
                          />
                          <Form.Check
                            type="radio"
                            label="Other (223 - age)"
                            name="gender"
                            id="gender-other"
                            value="other"
                            checked={gender === 'other'}
                            onChange={(e) => setGender(e.target.value)}
                          />
                        </div>
                      </Form.Group>
                    </Col>

                    {/* Age Input */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Age (years)</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          max="120"
                          placeholder="e.g., 30"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Buttons */}
                  <div className="d-flex gap-3">
                    <Button variant="danger" type="submit" className="flex-grow-1">
                      Calculate Heart Rate Zones
                    </Button>
                    <Button variant="outline-secondary" type="button" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </Form>

                {/* Max Heart Rate Result */}
                {maxHeartRate && (
                  <div className="mt-4">
                    <Card className="bg-light">
                      <Card.Body className="text-center">
                        <h4 className="mb-2">Maximum Heart Rate</h4>
                        <div className="max-hr-value">
                          <strong style={{ fontSize: '3rem', color: '#dc3545' }}>
                            {maxHeartRate}
                          </strong>
                          <span style={{ fontSize: '1.5rem', color: '#6c757d' }}> bpm</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {/* Heart Rate Zones Table */}
                {zones && (
                  <div className="mt-4">
                    <h4 className="mb-3">Training Zones</h4>
                    <Table striped bordered hover responsive className="zones-table">
                      <thead>
                        <tr>
                          <th>Zone</th>
                          <th>Name</th>
                          <th>Intensity</th>
                          <th>% of Max HR</th>
                          <th>Heart Rate Range (bpm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zones.map((zone, index) => (
                          <tr key={index} className={`zone-row zone-${zone.color}`}>
                            <td><strong>{zone.zone}</strong></td>
                            <td><strong>{zone.name}</strong></td>
                            <td>{zone.description}</td>
                            <td>{zone.percentage}</td>
                            <td className="hr-range">
                              <strong>{zone.min} - {zone.max}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Information Section */}
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <h5 className="mb-3">About Heart Rate Training Zones</h5>
                <p className="mb-2">
                  Training zones help you optimize your workouts by targeting specific fitness goals based on your heart rate intensity.
                </p>
                <ul className="mb-2">
                  <li><strong>Zone 1 (50-60%):</strong> Recovery and warm-up. Very comfortable pace.</li>
                  <li><strong>Zone 2 (60-70%):</strong> Endurance building. Improves aerobic capacity and fat burning.</li>
                  <li><strong>Zone 3 (70-80%):</strong> Aerobic training. Improves cardiovascular efficiency.</li>
                  <li><strong>Zone 4 (80-90%):</strong> Anaerobic threshold. Increases performance and speed.</li>
                  <li><strong>Zone 5 (90-100%):</strong> Maximum effort. Short bursts for peak performance.</li>
                </ul>
                <p className="mb-0">
                  <strong>Note:</strong> Maximum heart rate formulas are estimates. For more accurate measurements, consider a supervised exercise test or consult with a healthcare provider.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HeartRateCalculator;

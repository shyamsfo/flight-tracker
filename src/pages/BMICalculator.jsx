import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import './BMICalculator.css';

const BMICalculator = () => {
  const [gender, setGender] = useState('');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  const calculateBMI = (e) => {
    e.preventDefault();

    if (!gender || !height || !weight) {
      return;
    }

    let heightInMeters;
    let weightInKg;

    if (unitSystem === 'metric') {
      // Height in cm, weight in kg
      heightInMeters = parseFloat(height) / 100;
      weightInKg = parseFloat(weight);
    } else {
      // Height in inches, weight in pounds
      heightInMeters = (parseFloat(height) * 2.54) / 100;
      weightInKg = parseFloat(weight) * 0.453592;
    }

    const bmiValue = weightInKg / (heightInMeters * heightInMeters);
    setBmi(bmiValue.toFixed(1));

    // Determine BMI category
    if (bmiValue < 18.5) {
      setCategory('Underweight');
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      setCategory('Normal weight');
    } else if (bmiValue >= 25 && bmiValue < 30) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const resetForm = () => {
    setGender('');
    setHeight('');
    setWeight('');
    setBmi(null);
    setCategory('');
  };

  const getBMIColor = () => {
    if (!bmi) return 'secondary';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'info';
    if (bmiValue < 25) return 'success';
    if (bmiValue < 30) return 'warning';
    return 'danger';
  };

  return (
    <div className="bmi-calculator-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h2 className="mb-0 text-center">BMI Calculator</h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={calculateBMI}>
                  {/* Gender Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Gender</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        label="Male"
                        name="gender"
                        id="gender-male"
                        value="male"
                        checked={gender === 'male'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <Form.Check
                        type="radio"
                        label="Female"
                        name="gender"
                        id="gender-female"
                        value="female"
                        checked={gender === 'female'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      <Form.Check
                        type="radio"
                        label="Other"
                        name="gender"
                        id="gender-other"
                        value="other"
                        checked={gender === 'other'}
                        onChange={(e) => setGender(e.target.value)}
                      />
                    </div>
                  </Form.Group>

                  {/* Unit System Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Unit System</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        label="Metric (cm, kg)"
                        name="unitSystem"
                        id="unit-metric"
                        value="metric"
                        checked={unitSystem === 'metric'}
                        onChange={(e) => setUnitSystem(e.target.value)}
                      />
                      <Form.Check
                        type="radio"
                        label="Imperial (inches, lbs)"
                        name="unitSystem"
                        id="unit-imperial"
                        value="imperial"
                        checked={unitSystem === 'imperial'}
                        onChange={(e) => setUnitSystem(e.target.value)}
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    {/* Height Input */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Height {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.1"
                          placeholder={unitSystem === 'metric' ? 'e.g., 170' : 'e.g., 67'}
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>

                    {/* Weight Input */}
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">
                          Weight {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.1"
                          placeholder={unitSystem === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Buttons */}
                  <div className="d-flex gap-3">
                    <Button variant="primary" type="submit" className="flex-grow-1">
                      Calculate BMI
                    </Button>
                    <Button variant="outline-secondary" type="button" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </Form>

                {/* BMI Result */}
                {bmi && (
                  <Alert variant={getBMIColor()} className="mt-4 mb-0">
                    <div className="text-center">
                      <h4 className="mb-2">Your BMI Result</h4>
                      <div className="bmi-result-value mb-2">
                        <strong style={{ fontSize: '2.5rem' }}>{bmi}</strong>
                      </div>
                      <div className="bmi-category mb-3">
                        <strong>Category:</strong> {category}
                      </div>
                      <div className="bmi-info small">
                        <strong>BMI Categories:</strong>
                        <ul className="list-unstyled mt-2 mb-0">
                          <li>Underweight: &lt; 18.5</li>
                          <li>Normal weight: 18.5 - 24.9</li>
                          <li>Overweight: 25 - 29.9</li>
                          <li>Obese: ≥ 30</li>
                        </ul>
                      </div>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Information Section */}
            <Card className="shadow-sm mt-4">
              <Card.Body>
                <h5 className="mb-3">About BMI</h5>
                <p className="mb-2">
                  Body Mass Index (BMI) is a measure of body fat based on height and weight that applies to adult men and women.
                </p>
                <p className="mb-0">
                  <strong>Note:</strong> BMI is a screening tool and does not directly measure body fat or health.
                  Consult with a healthcare provider for personalized health assessments.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BMICalculator;

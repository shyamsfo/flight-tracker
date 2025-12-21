import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CoinFlipper.css';

const CoinFlipper = () => {
  const [numFlips, setNumFlips] = useState(1);
  const [totalHeads, setTotalHeads] = useState(0);
  const [totalTails, setTotalTails] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoins = () => {
    const flipsToPerform = parseInt(numFlips);

    if (isNaN(flipsToPerform) || flipsToPerform < 1) {
      return;
    }

    setIsFlipping(true);

    // Simulate animation delay
    setTimeout(() => {
      let heads = totalHeads;
      let tails = totalTails;
      const newChartData = [...chartData];

      // Perform flips
      for (let i = 0; i < flipsToPerform; i++) {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';

        if (result === 'heads') {
          heads++;
        } else {
          tails++;
        }

        // Calculate ratio (heads / total flips)
        const totalFlips = heads + tails;
        const ratio = heads / totalFlips;

        // Add data point to chart
        newChartData.push({
          flipNumber: totalFlips,
          ratio: ratio,
          headsPercentage: (ratio * 100).toFixed(2),
          tailsPercentage: ((1 - ratio) * 100).toFixed(2),
        });
      }

      setTotalHeads(heads);
      setTotalTails(tails);
      setChartData(newChartData);
      setIsFlipping(false);
    }, 300);
  };

  const handleReset = () => {
    setTotalHeads(0);
    setTotalTails(0);
    setChartData([]);
    setNumFlips(1);
  };

  const totalFlips = totalHeads + totalTails;
  const headsPercentage = totalFlips > 0 ? ((totalHeads / totalFlips) * 100).toFixed(2) : 0;
  const tailsPercentage = totalFlips > 0 ? ((totalTails / totalFlips) * 100).toFixed(2) : 0;

  return (
    <div className="coin-flipper-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-warning text-dark">
                <h2 className="mb-0 text-center">Coin Flipper</h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Number of Flips</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="10000"
                        value={numFlips}
                        onChange={(e) => setNumFlips(e.target.value)}
                        disabled={isFlipping}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="d-flex align-items-end">
                    <div className="d-flex gap-2 mb-3 w-100">
                      <Button
                        variant="warning"
                        onClick={flipCoins}
                        disabled={isFlipping}
                        className="flex-grow-1"
                      >
                        {isFlipping ? 'Flipping...' : 'Flip Coin'}
                      </Button>
                      {totalFlips > 0 && (
                        <Button
                          variant="outline-secondary"
                          onClick={handleReset}
                          disabled={isFlipping}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </Col>
                </Row>

                {/* Results */}
                {totalFlips > 0 && (
                  <div className="results-section mt-4">
                    <h5 className="mb-3">Results</h5>
                    <Row>
                      <Col xs={6} md={3}>
                        <div className="result-card heads-card">
                          <div className="result-label">Heads</div>
                          <div className="result-value">{totalHeads}</div>
                          <Badge bg="primary" className="mt-2">{headsPercentage}%</Badge>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="result-card tails-card">
                          <div className="result-label">Tails</div>
                          <div className="result-value">{totalTails}</div>
                          <Badge bg="secondary" className="mt-2">{tailsPercentage}%</Badge>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="result-card total-card">
                          <div className="result-label">Total Flips</div>
                          <div className="result-value">{totalFlips}</div>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="result-card ratio-card">
                          <div className="result-label">Heads Ratio</div>
                          <div className="result-value">{(totalHeads / totalFlips).toFixed(4)}</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Chart */}
            {chartData.length > 0 && (
              <Card className="shadow-sm">
                <Card.Body className="p-4">
                  <h5 className="mb-4">Heads/Tails Ratio Over Time</h5>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="flipNumber"
                        label={{ value: 'Number of Flips', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        domain={[0.45, 0.55]}
                        label={{ value: 'Heads Ratio', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => value.toFixed(4)}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="custom-tooltip">
                                <p className="label"><strong>Flip #{payload[0].payload.flipNumber}</strong></p>
                                <p className="heads">Heads: {payload[0].payload.headsPercentage}%</p>
                                <p className="tails">Tails: {payload[0].payload.tailsPercentage}%</p>
                                <p className="ratio">Ratio: {payload[0].value.toFixed(4)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ratio"
                        stroke="#0d6efd"
                        strokeWidth={2}
                        dot={chartData.length <= 100}
                        name="Heads Ratio"
                      />
                      {/* Reference line at 0.5 (expected value) */}
                      <Line
                        type="monotone"
                        data={[{ flipNumber: 1, expected: 0.5 }, { flipNumber: chartData[chartData.length - 1].flipNumber, expected: 0.5 }]}
                        dataKey="expected"
                        stroke="#dc3545"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Expected (0.5)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-description mt-3 text-muted">
                    <small>
                      The chart shows the ratio of heads to total flips over time.
                      The dashed red line at 0.5 represents the expected probability for a fair coin.
                      With more flips, the ratio should converge to 0.5 (Law of Large Numbers).
                    </small>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Information */}
            {totalFlips === 0 && (
              <Card className="shadow-sm">
                <Card.Body className="text-center py-5">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-3"
                    style={{ color: '#ffc107' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <h5 className="text-muted">No flips yet</h5>
                  <p className="text-muted mb-0">
                    Enter the number of times you want to flip the coin and click "Flip Coin" to get started
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CoinFlipper;

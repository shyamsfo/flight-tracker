import { useState, useCallback, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import Papa from 'papaparse';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './CSVViewer.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

const CSVViewer = () => {
  const [inputMode, setInputMode] = useState('file');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');



  useEffect(() => {
      ModuleRegistry.registerModules([ AllCommunityModule ]);
  } , []); //

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  }), []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const parseCSV = useCallback((csvText, source) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Create column definitions from the first row
          const columns = Object.keys(results.data[0]).map((key) => ({
            field: key,
            headerName: key,
            filter: 'agTextColumnFilter',
          }));

          setColumnDefs(columns);
          setRowData(results.data);
          setError('');
          setLoading(false);
        } else {
          setError('No data found in CSV file');
          setLoading(false);
        }
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
        setLoading(false);
      },
    });
  }, []);

  const handleFileUpload = () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      parseCSV(csvText, 'file');
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleUrlLoad = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const urlFileName = url.split('/').pop() || 'remote-file.csv';
      setFileName(urlFileName);
      parseCSV(csvText, 'url');
    } catch (err) {
      setError(`Failed to load CSV from URL: ${err.message}`);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRowData([]);
    setColumnDefs([]);
    setFile(null);
    setUrl('');
    setError('');
    setFileName('');
  };

  const downloadCSV = () => {
    if (rowData.length === 0) return;
    const csv = Papa.unparse(rowData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const downloadFileName = fileName || 'export.csv';

    link.href = URL.createObjectURL(blob);
    link.download = downloadFileName;
    link.click();
  };

  return (
    <div className="csv-viewer-page">
      <Container fluid className="py-4">
        <Row className="justify-content-center mb-4">
          <Col lg={10} xl={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-success text-white">
                <h2 className="mb-0 text-center">CSV Viewer</h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Tabs
                  activeKey={inputMode}
                  onSelect={(k) => {
                    setInputMode(k);
                    setError('');
                  }}
                  className="mb-4"
                >
                  <Tab eventKey="file" title="Upload File">
                    <div className="mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Select CSV File</Form.Label>
                        <Form.Control
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                        />
                        <Form.Text className="text-muted">
                          Only CSV files are accepted
                        </Form.Text>
                      </Form.Group>
                      <Button
                        variant="success"
                        onClick={handleFileUpload}
                        disabled={!file || loading}
                        className="me-2"
                      >
                        {loading ? 'Loading...' : 'Load CSV'}
                      </Button>
                      {rowData.length > 0 && (
                        <>
                          <Button
                            variant="outline-secondary"
                            onClick={handleReset}
                            className="me-2"
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={downloadCSV}
                          >
                            Download CSV
                          </Button>
                        </>
                      )}
                    </div>
                  </Tab>

                  <Tab eventKey="url" title="Load from URL">
                    <div className="mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">CSV File URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://example.com/data.csv"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                          Enter the URL of a CSV file
                        </Form.Text>
                      </Form.Group>
                      <Button
                        variant="success"
                        onClick={handleUrlLoad}
                        disabled={!url || loading}
                        className="me-2"
                      >
                        {loading ? 'Loading...' : 'Load from URL'}
                      </Button>
                      {rowData.length > 0 && (
                        <>
                          <Button
                            variant="outline-secondary"
                            onClick={handleReset}
                            className="me-2"
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={downloadCSV}
                          >
                            Download CSV
                          </Button>
                        </>
                      )}
                    </div>
                  </Tab>
                </Tabs>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                {fileName && rowData.length > 0 && (
                  <Alert variant="info" className="mt-3">
                    <strong>File:</strong> {fileName} | <strong>Rows:</strong> {rowData.length} | <strong>Columns:</strong> {columnDefs.length}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {rowData.length > 0 && (
          <Row className="justify-content-center">
            <Col xs={12}>
              <Card className="shadow-sm">
                <Card.Body className="p-2">
                  <div className="ag-theme-alpine csv-grid">
                    <AgGridReact
                      rowData={rowData}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      pagination={true}
                      paginationPageSize={50}
                      paginationPageSizeSelector={[50, 100, 200, 500]}
                      domLayout="normal"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {rowData.length === 0 && (
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
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
                    style={{ color: '#6c757d' }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                  <h5 className="text-muted">No CSV data loaded</h5>
                  <p className="text-muted mb-0">
                    Upload a CSV file or load one from a URL to get started
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default CSVViewer;

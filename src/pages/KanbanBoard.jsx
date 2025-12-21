import { useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Badge, Card as BootstrapCard } from 'react-bootstrap';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import './KanbanBoard.css';

const COLORS = [
  { name: 'Blue', value: '#0d6efd' },
  { name: 'Green', value: '#198754' },
  { name: 'Yellow', value: '#ffc107' },
  { name: 'Red', value: '#dc3545' },
  { name: 'Purple', value: '#6f42c1' }
];

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', cards: [] },
    { id: 'inprogress', title: 'In Progress', cards: [] },
    { id: 'complete', title: 'Complete', cards: [] }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  // Card form state
  const [cardTitle, setCardTitle] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [cardTags, setCardTags] = useState('');
  const [cardColor, setCardColor] = useState(COLORS[0].value);
  const [cardDueDate, setCardDueDate] = useState(null);

  // Filter state
  const [filterTags, setFilterTags] = useState([]);
  const [filterColors, setFilterColors] = useState([]);

  // Column settings state
  const [editingColumns, setEditingColumns] = useState([]);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get all unique tags from all cards
  const getAllTags = () => {
    const tags = new Set();
    columns.forEach(column => {
      column.cards.forEach(card => {
        card.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags);
  };

  // Filter cards based on selected tags and colors
  const getFilteredCards = (cards) => {
    return cards.filter(card => {
      const tagMatch = filterTags.length === 0 || card.tags.some(tag => filterTags.includes(tag));
      const colorMatch = filterColors.length === 0 || filterColors.includes(card.color);
      return tagMatch && colorMatch;
    });
  };

  const handleOpenAddCard = (columnId) => {
    setSelectedColumn(columnId);
    setShowAddCard(true);
  };

  const handleCloseAddCard = () => {
    setShowAddCard(false);
    setCardTitle('');
    setCardContent('');
    setCardTags('');
    setCardColor(COLORS[0].value);
    setCardDueDate(null);
    setSelectedColumn(null);
  };

  const handleAddCard = () => {
    if (!cardTitle.trim()) return;

    const newCard = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      content: cardContent,
      tags: cardTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      color: cardColor,
      dueDate: cardDueDate
    };

    setColumns(columns.map(col => {
      if (col.id === selectedColumn) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    }));

    handleCloseAddCard();
  };

  const handleDeleteCard = (columnId, cardId) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
      }
      return col;
    }));
  };

  const handleOpenColumnSettings = () => {
    setEditingColumns(JSON.parse(JSON.stringify(columns)));
    setShowColumnSettings(true);
  };

  const handleCloseColumnSettings = () => {
    setShowColumnSettings(false);
    setEditingColumns([]);
    setNewColumnTitle('');
  };

  const handleSaveColumns = () => {
    setColumns(editingColumns);
    handleCloseColumnSettings();
  };

  const handleUpdateColumnTitle = (columnId, newTitle) => {
    setEditingColumns(editingColumns.map(col => {
      if (col.id === columnId) {
        return { ...col, title: newTitle };
      }
      return col;
    }));
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      cards: []
    };

    setEditingColumns([...editingColumns, newColumn]);
    setNewColumnTitle('');
  };

  const handleDeleteColumn = (columnId) => {
    setEditingColumns(editingColumns.filter(col => col.id !== columnId));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const activeColumn = columns.find(col =>
      col.cards.some(card => card.id === active.id)
    );
    const activeCardData = activeColumn?.cards.find(card => card.id === active.id);
    setActiveCard(activeCardData);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCardId = active.id;
    const overColumnId = over.id;

    // Find source column
    const sourceColumn = columns.find(col =>
      col.cards.some(card => card.id === activeCardId)
    );

    if (!sourceColumn) return;

    const activeCard = sourceColumn.cards.find(card => card.id === activeCardId);

    // Check if dropping on a column
    const targetColumn = columns.find(col => col.id === overColumnId);

    if (targetColumn && sourceColumn.id !== targetColumn.id) {
      // Move card to different column
      setColumns(columns.map(col => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: col.cards.filter(card => card.id !== activeCardId) };
        }
        if (col.id === targetColumn.id) {
          return { ...col, cards: [...col.cards, activeCard] };
        }
        return col;
      }));
    }
  };

  const toggleFilterTag = (tag) => {
    setFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleFilterColor = (color) => {
    setFilterColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const clearFilters = () => {
    setFilterTags([]);
    setFilterColors([]);
  };

  const allTags = getAllTags();

  return (
    <div className="kanban-board-page">
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>Kanban Board</h2>
              <Button variant="secondary" onClick={handleOpenColumnSettings}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m-7-7h6m6 0h6" />
                </svg>
                Manage Columns
              </Button>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        {(allTags.length > 0 || COLORS.length > 0) && (
          <Row className="mb-4">
            <Col>
              <BootstrapCard className="filter-card">
                <BootstrapCard.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      {/* Tag Filters */}
                      {allTags.length > 0 && (
                        <div className="mb-3">
                          <strong className="me-2">Filter by Tags:</strong>
                          {allTags.map(tag => (
                            <Badge
                              key={tag}
                              bg={filterTags.includes(tag) ? 'primary' : 'secondary'}
                              className="me-2 mb-2 filter-badge"
                              onClick={() => toggleFilterTag(tag)}
                              style={{ cursor: 'pointer' }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Color Filters */}
                      <div>
                        <strong className="me-2">Filter by Color:</strong>
                        {COLORS.map(color => (
                          <Badge
                            key={color.value}
                            className="me-2 mb-2 color-filter-badge"
                            onClick={() => toggleFilterColor(color.value)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: color.value,
                              border: filterColors.includes(color.value) ? '3px solid #000' : '3px solid transparent',
                              opacity: filterColors.length === 0 || filterColors.includes(color.value) ? 1 : 0.3
                            }}
                          >
                            {color.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {(filterTags.length > 0 || filterColors.length > 0) && (
                      <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </BootstrapCard.Body>
              </BootstrapCard>
            </Col>
          </Row>
        )}

        {/* Kanban Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="kanban-columns-container">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={getFilteredCards(column.cards)}
                onAddCard={handleOpenAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div style={{ opacity: 0.5 }}>
                <KanbanCard card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Container>

      {/* Add Card Modal */}
      <Modal show={showAddCard} onHide={handleCloseAddCard} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Card</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter card title"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter card content"
                value={cardContent}
                onChange={(e) => setCardContent(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., urgent, frontend, bug"
                value={cardTags}
                onChange={(e) => setCardTags(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <div className="d-flex gap-2">
                {COLORS.map(color => (
                  <div
                    key={color.value}
                    className="color-option"
                    style={{
                      backgroundColor: color.value,
                      border: cardColor === color.value ? '3px solid #000' : '3px solid #dee2e6',
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setCardColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <div>
                <DatePicker
                  selected={cardDueDate}
                  onChange={(date) => setCardDueDate(date)}
                  dateFormat="MMM dd, yyyy"
                  placeholderText="Select due date"
                  className="form-control"
                  minDate={new Date()}
                />
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddCard}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCard}>
            Add Card
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Column Settings Modal */}
      <Modal show={showColumnSettings} onHide={handleCloseColumnSettings} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6>Existing Columns</h6>
            {editingColumns.map(column => (
              <div key={column.id} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={column.title}
                  onChange={(e) => handleUpdateColumnTitle(column.id, e.target.value)}
                />
                <Button
                  variant="danger"
                  onClick={() => handleDeleteColumn(column.id)}
                  disabled={editingColumns.length <= 1}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          <div>
            <h6>Add New Column</h6>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Enter column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
              />
              <Button variant="success" onClick={handleAddColumn}>
                Add
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseColumnSettings}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveColumns}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KanbanBoard;

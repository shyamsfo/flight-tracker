import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button } from 'react-bootstrap';
import './KanbanCard.css';

const KanbanCard = ({ card, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-card"
      {...attributes}
      {...listeners}
    >
      <div className="kanban-card-header">
        <div className="kanban-card-title-wrapper">
          <div
            className="kanban-card-color-indicator"
            style={{ backgroundColor: card.color }}
            title="Card Color"
          />
          <h6 className="kanban-card-title">{card.title}</h6>
        </div>
        {onDelete && (
          <Button
            variant="link"
            size="sm"
            className="kanban-card-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        )}
      </div>

      {card.content && (
        <div className="kanban-card-content">
          {card.content}
        </div>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="kanban-card-tags">
          {card.tags.map((tag, index) => (
            <Badge key={index} bg="secondary" className="me-1">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {card.dueDate && (
        <div className="kanban-card-footer">
          <div className={`kanban-card-due-date ${isOverdue(card.dueDate) ? 'overdue' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(card.dueDate)}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanCard;

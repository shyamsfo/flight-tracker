import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from 'react-bootstrap';
import KanbanCard from './KanbanCard';
import './KanbanColumn.css';

const KanbanColumn = ({ column, cards, onAddCard, onDeleteCard }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <h5 className="kanban-column-title">{column.title}</h5>
        <span className="kanban-column-count">{cards.length}</span>
      </div>

      <div className="kanban-column-body" ref={setNodeRef}>
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={() => onDeleteCard(column.id, card.id)}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && (
          <div className="kanban-column-empty">
            Drop cards here
          </div>
        )}
      </div>

      <div className="kanban-column-footer">
        <Button
          variant="outline-primary"
          size="sm"
          className="w-100"
          onClick={() => onAddCard(column.id)}
        >
          + Add Card
        </Button>
      </div>
    </div>
  );
};

export default KanbanColumn;

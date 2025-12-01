import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './QANode.css';

const QANode = ({ data, isConnectable }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`qa-node ${data.isRoot ? 'qa-node-root' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="qa-node-handle"
      />

      <div className="qa-node-content">
        <div className="qa-node-question">
          <div className="qa-node-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="qa-node-question-text">{data.question}</div>
        </div>

        <button
          className="qa-node-toggle"
          onClick={toggleExpand}
          aria-label={isExpanded ? 'Collapse answer' : 'Expand answer'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isExpanded && (
          <div className="qa-node-answer">
            <div className="qa-node-answer-label">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Answer:
            </div>
            <div className="qa-node-answer-text">{data.answer}</div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="qa-node-handle"
      />
    </div>
  );
};

export default memo(QANode);

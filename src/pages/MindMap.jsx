import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Spinner, Container } from 'react-bootstrap';
import QANode from '../components/QANode';
import AddNodeModal from '../components/AddNodeModal';
import { fetchMindMapGraph, addQuestionNode } from '../services/mockMindMapApi';
import './MindMap.css';

const nodeTypes = {
  qaNode: QANode,
};

const MindMap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(async ({ question, answer, parentId }) => {
    try {
      // In the future, this will call the backend API to get the answer
      const { node: newNode, edge: newEdge } = await addQuestionNode(parentId, question, answer);

      // Find parent node to calculate position
      const parentNode = nodes.find((n) => n.id === parentId);
      if (parentNode) {
        // Count existing children of this parent
        const childrenCount = edges.filter((e) => e.source === parentId).length;

        // Position new node below and slightly offset based on children count
        newNode.position = {
          x: parentNode.position.x + (childrenCount * 150) - (childrenCount > 0 ? 75 : 0),
          y: parentNode.position.y + 180
        };
      }

      // Add new node and edge to the graph
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
    } catch (error) {
      console.error('Error adding node:', error);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Load initial graph data
  useEffect(() => {
    const loadGraph = async () => {
      setIsLoading(true);
      try {
        const graphData = await fetchMindMapGraph();
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
      } catch (error) {
        console.error('Error loading mind map:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGraph();
  }, [setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="mindmap-loading">
        <Container className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading mind map...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="mindmap-container">
      <div className="mindmap-header">
        <div className="mindmap-header-content">
          <h1 className="mindmap-title">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            DeepStore Explorer
          </h1>
          <p className="mindmap-subtitle">
            Explore knowledge in a non-linear way. Click nodes to expand answers and see connections.
          </p>
        </div>
        <div className="mindmap-instructions">
          <div className="mindmap-instruction-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
            </svg>
            Pan &amp; Zoom
          </div>
          <div className="mindmap-instruction-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Click to Expand
          </div>
          <div className="mindmap-instruction-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Explore Paths
          </div>
        </div>
      </div>

      <div className="mindmap-flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="mindmap-flow"
        >
          <Controls className="mindmap-controls" />
          <MiniMap
            className="mindmap-minimap"
            nodeColor={(node) => {
              if (node.data.isRoot) return '#764ba2';
              return '#667eea';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>

        {/* Floating Action Button */}
        <button
          className="add-node-fab"
          onClick={() => setShowAddModal(true)}
          aria-label="Add new node"
          title="Add new question node"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      </div>

      {/* Add Node Modal */}
      <AddNodeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAddNode={handleAddNode}
        nodes={nodes}
      />
    </div>
  );
};

export default MindMap;

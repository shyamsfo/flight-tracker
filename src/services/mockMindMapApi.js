// Mock mind map graph data
const mockGraphData = {
  nodes: [
    {
      id: 'root',
      type: 'qaNode',
      data: {
        question: 'What is React?',
        answer: 'React is a JavaScript library for building user interfaces, particularly single-page applications. It allows developers to create reusable UI components.',
        isRoot: true
      },
      position: { x: 250, y: 50 }
    },
    {
      id: 'node-1',
      type: 'qaNode',
      data: {
        question: 'What are React components?',
        answer: 'Components are independent, reusable pieces of code. They serve the same purpose as JavaScript functions, but work in isolation and return HTML.',
        isRoot: false
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'node-2',
      type: 'qaNode',
      data: {
        question: 'What is JSX?',
        answer: 'JSX is a syntax extension to JavaScript that allows you to write HTML-like code in your JavaScript files. It makes React code more readable and easier to write.',
        isRoot: false
      },
      position: { x: 400, y: 200 }
    },
    {
      id: 'node-3',
      type: 'qaNode',
      data: {
        question: 'What are props?',
        answer: 'Props (short for properties) are arguments passed into React components. They are passed to components via HTML attributes and are read-only.',
        isRoot: false
      },
      position: { x: 50, y: 350 }
    },
    {
      id: 'node-4',
      type: 'qaNode',
      data: {
        question: 'What is state?',
        answer: 'State is a built-in React object used to store property values that belong to a component. When state changes, the component re-renders.',
        isRoot: false
      },
      position: { x: 250, y: 350 }
    },
    {
      id: 'node-5',
      type: 'qaNode',
      data: {
        question: 'What are React Hooks?',
        answer: 'Hooks are functions that let you use state and other React features in functional components. Examples include useState, useEffect, and useContext.',
        isRoot: false
      },
      position: { x: 450, y: 350 }
    },
    {
      id: 'node-6',
      type: 'qaNode',
      data: {
        question: 'What is useState?',
        answer: 'useState is a Hook that lets you add state to functional components. It returns an array with the current state value and a function to update it.',
        isRoot: false
      },
      position: { x: 350, y: 500 }
    },
    {
      id: 'node-7',
      type: 'qaNode',
      data: {
        question: 'What is useEffect?',
        answer: 'useEffect is a Hook that lets you perform side effects in functional components. It runs after every render and can be used for data fetching, subscriptions, etc.',
        isRoot: false
      },
      position: { x: 550, y: 500 }
    }
  ],
  edges: [
    {
      id: 'edge-root-1',
      source: 'root',
      target: 'node-1',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-root-2',
      source: 'root',
      target: 'node-2',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-1-3',
      source: 'node-1',
      target: 'node-3',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-1-4',
      source: 'node-1',
      target: 'node-4',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-2-5',
      source: 'node-2',
      target: 'node-5',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-5-6',
      source: 'node-5',
      target: 'node-6',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    },
    {
      id: 'edge-5-7',
      source: 'node-5',
      target: 'node-7',
      animated: true,
      style: { stroke: '#667eea', strokeWidth: 2 }
    }
  ]
};

/**
 * Mock API function to fetch mind map graph data
 * @returns {Promise<Object>} - Promise that resolves to graph data with nodes and edges
 */
export const fetchMindMapGraph = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return mockGraphData;
};

/**
 * Mock API function to add a new question/answer node to the graph
 * @param {string} parentId - ID of the parent node
 * @param {string} question - The question text
 * @param {string} answer - The answer text
 * @returns {Promise<Object>} - Promise that resolves to the new node data
 */
export const addQuestionNode = async (parentId, question, answer) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const newNodeId = `node-${Date.now()}`;
  const newNode = {
    id: newNodeId,
    type: 'qaNode',
    data: {
      question,
      answer,
      isRoot: false
    },
    // Position will be calculated by the component
    position: { x: 0, y: 0 }
  };

  const newEdge = {
    id: `edge-${parentId}-${newNodeId}`,
    source: parentId,
    target: newNodeId,
    animated: true,
    style: { stroke: '#667eea', strokeWidth: 2 }
  };

  return { node: newNode, edge: newEdge };
};

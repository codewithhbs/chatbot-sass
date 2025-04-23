import { useCallback, useState, useMemo, useRef, useEffect, useContext } from "react"
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Panel } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Save, Play, Settings, Loader } from "lucide-react"
import NodeEditModal from "./node-edit-modal"
import CustomNode from "./custom-node"
import PreviewModal from "./preview-modal"
import axios from "axios"
import AuthContext from "@/context/authContext"
import { useParams } from "react-router-dom"

const FlowChatbot = () => {

  const { id } = useParams()
  const metaCode = new URLSearchParams(window.location.search).get("metaCode");

  const { token } = useContext(AuthContext)
  // State for flow elements
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [activeTab, setActiveTab] = useState("builder")
  const [isLoading, setIsLoading] = useState(false)
  const [flowData, setFlowData] = useState({
    botId: "",
    metaCode: "",
    name: "New Chatbot Flow",
    description: "",
    welcomeMessage: "Welcome to our chatbot. How can I help you today?",
    endMessage: "Thank you for your time. Have a great day!"
  })

  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  // Fetch existing flow data or start with empty flow
  useEffect(() => {
    const fetchFlowData = async () => {
      setIsLoading(true)
      try {
        // Replace with your actual API endpoint
        const response = await axios.get(`http://localhost:7400/api/auth/bots-config/flow/${id}/${metaCode}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        const data = response.data.data
        console.log("Fetched flow data:", data)
        setFlowData(data)

        // Convert steps to nodes
        const flowNodes = data.steps.map((step, index) => ({
          id: step.stepId,
          type: "custom",
          position: { x: 250, y: index * 150 }, // Position nodes in a column initially
          data: {
            ...step,
            onNodeClick: handleNodeClick
          }
        }))
        setNodes(flowNodes)

        // Create edges based on connections
        const flowEdges = []
        data.steps.forEach(step => {
          // Handle default next step
          if (step.defaultNextStepId) {
            flowEdges.push({
              id: `e-${step.stepId}-${step.defaultNextStepId}`,
              source: step.stepId,
              target: step.defaultNextStepId,
              animated: true,
              style: { stroke: "#6366f1", strokeWidth: 2 }
            })
          }

          // Handle option connections for dropdown and multiselect
          if (['dropdown', 'multiselect'].includes(step.type) && step.optionConnections) {
            step.optionConnections.forEach((connection, idx) => {
              if (connection.nextStepId) {
                flowEdges.push({
                  id: `e-${step.stepId}-${connection.nextStepId}-${idx}`,
                  source: step.stepId,
                  target: connection.nextStepId,
                  sourceHandle: `option-${idx}`,
                  animated: true,
                  label: connection.optionValue,
                  style: { stroke: "#6366f1", strokeWidth: 2 }
                })
              }
            })
          }
        })
        setEdges(flowEdges)
      } catch (err) {
        console.error("Error fetching flow data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlowData()
  }, [])

  // Memoize nodeTypes to prevent recreation on each render
  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode
    }),
    []
  )

  const onConnect = useCallback(
    (params) => {
      // Find source node to determine its type
      const sourceNode = nodes.find((node) => node.id === params.source)

      if (!sourceNode) return

      if (['dropdown', 'multiselect'].includes(sourceNode.data.type)) {
        // For dropdown/multiselect nodes, determine which option this connection belongs to
        const sourceHandle = params.sourceHandle
        let optionIndex = 0

        if (sourceHandle && sourceHandle.startsWith('option-')) {
          optionIndex = parseInt(sourceHandle.split('-')[1])
        }

        // Update the node's data to store the connection
        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id === params.source) {
              const updatedOptionConnections = [...node.data.optionConnections]

              // Update or create the option connection
              if (optionIndex < node.data.options.length) {
                const optionValue = node.data.options[optionIndex]

                // Find existing connection for this option
                const existingConnIdx = updatedOptionConnections.findIndex(
                  conn => conn.optionValue === optionValue
                )

                if (existingConnIdx >= 0) {
                  // Update existing connection
                  updatedOptionConnections[existingConnIdx] = {
                    ...updatedOptionConnections[existingConnIdx],
                    nextStepId: params.target
                  }
                } else {
                  // Create new connection
                  updatedOptionConnections.push({
                    optionValue: optionValue,
                    nextStepId: params.target
                  })
                }
              }

              return {
                ...node,
                data: {
                  ...node.data,
                  optionConnections: updatedOptionConnections
                }
              }
            }
            return node
          })
        )
      } else {
        // For other node types, store as default next step
        setNodes(prevNodes =>
          prevNodes.map(node => {
            if (node.id === params.source) {
              return {
                ...node,
                data: {
                  ...node.data,
                  defaultNextStepId: params.target
                }
              }
            }
            return node
          })
        )
      }

      // Add the visual edge
      setEdges((edges) => addEdge({
        ...params,
        id: `e-${params.source}-${params.target}${params.sourceHandle ? `-${params.sourceHandle}` : ''}`,
        animated: true,
        style: { stroke: "#6366f1", strokeWidth: 2 }
      }, edges))
    },
    [nodes, setNodes, setEdges]
  )

  const handleNodeClick = (id) => {
    setSelectedNodeId(id)
    setShowEditModal(true)
  }

  const addNewNode = useCallback(() => {
    if (!reactFlowInstance) return

    const newStepId = `step_${Date.now()}`

    // Calculate position based on viewport
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowWrapper.current.offsetWidth / 2,
      y: reactFlowWrapper.current.offsetHeight / 2,
    })

    const newNode = {
      id: newStepId,
      position,
      type: "custom",
      data: {
        stepId: newStepId,
        type: "text", // Default to text input
        question: "New question",
        responseTemplate: "Thank you for your response: {response}",
        validation: {
          required: false,
          pattern: null,
          errorMessage: "This field is required"
        },
        options: [],
        optionConnections: [],
        defaultNextStepId: null,
        isStart: false,
        isEnd: false,
        onNodeClick: handleNodeClick
      },
    }

    setNodes((nodes) => [...nodes, newNode])
  }, [reactFlowInstance, setNodes])

  const handleNodeUpdate = (updatedData) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === selectedNodeId) {
          // Ensure optionConnections array is properly updated for any changes to options
          let optionConnections = [...(updatedData.optionConnections || [])]

          // If options have changed, update the optionConnections accordingly
          if (updatedData.options &&
            (updatedData.type === 'dropdown' || updatedData.type === 'multiselect')) {

            // Keep connections for options that still exist
            optionConnections = optionConnections.filter(
              conn => updatedData.options.includes(conn.optionValue)
            )

            // Add empty connections for new options
            updatedData.options.forEach(option => {
              if (!optionConnections.some(conn => conn.optionValue === option)) {
                optionConnections.push({
                  optionValue: option,
                  nextStepId: null
                })
              }
            })
          }

          return {
            ...node,
            data: {
              ...node.data,
              ...updatedData,
              optionConnections,
              onNodeClick: handleNodeClick
            }
          }
        }
        return node
      })
    )

    // Update edges if node type changed
    updateEdgesAfterNodeChange(selectedNodeId, updatedData)

    setShowEditModal(false)
  }

  const updateEdgesAfterNodeChange = (nodeId, updatedData) => {
    // If node type changed between dropdown/multiselect and other types
    // we need to update the edges
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    const wasOptionBased = ['dropdown', 'multiselect'].includes(node.data.type)
    const isOptionBased = ['dropdown', 'multiselect'].includes(updatedData.type)

    if (wasOptionBased !== isOptionBased) {
      // Remove all edges connected to this node as source
      setEdges(edges => edges.filter(edge => edge.source !== nodeId))

      // If changing to option-based, create edges for each option connection
      if (isOptionBased && updatedData.optionConnections) {
        const newEdges = updatedData.optionConnections
          .filter(conn => conn.nextStepId)
          .map((conn, idx) => ({
            id: `e-${nodeId}-${conn.nextStepId}-${idx}`,
            source: nodeId,
            target: conn.nextStepId,
            sourceHandle: `option-${idx}`,
            animated: true,
            label: conn.optionValue,
            style: { stroke: "#6366f1", strokeWidth: 2 }
          }))

        setEdges(edges => [...edges, ...newEdges])
      }
      // If changing to non-option-based, create a single edge if defaultNextStepId exists
      else if (updatedData.defaultNextStepId) {
        setEdges(edges => [
          ...edges,
          {
            id: `e-${nodeId}-${updatedData.defaultNextStepId}`,
            source: nodeId,
            target: updatedData.defaultNextStepId,
            animated: true,
            style: { stroke: "#6366f1", strokeWidth: 2 }
          }
        ])
      }
    }
  }

  const deleteNode = useCallback(
    (id) => {
      // Remove the node
      setNodes((nodes) => nodes.filter((node) => node.id !== id))

      // Remove any edges connected to this node
      setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id))

      // Update any nodes that had this node as their next step
      setNodes((nodes) =>
        nodes.map(node => {
          // Check default next step
          if (node.data.defaultNextStepId === id) {
            return {
              ...node,
              data: {
                ...node.data,
                defaultNextStepId: null
              }
            }
          }

          // Check option connections
          if (node.data.optionConnections && node.data.optionConnections.some(conn => conn.nextStepId === id)) {
            return {
              ...node,
              data: {
                ...node.data,
                optionConnections: node.data.optionConnections.map(conn =>
                  conn.nextStepId === id ? { ...conn, nextStepId: null } : conn
                )
              }
            }
          }

          return node
        })
      )

      setShowEditModal(false)
    },
    [setNodes, setEdges]
  )

  const saveFlow = async () => {
    setIsLoading(true);

    // Create steps array for MongoDB schema
    const steps = nodes.map((node) => ({
      stepId: node.data.stepId,
      type: node.data.type,
      question: node.data.question,
      responseTemplate: node.data.responseTemplate || "",
      validation: {
        required: node.data.validation?.required || false,
        pattern: node.data.validation?.pattern || null,
        errorMessage: node.data.validation?.errorMessage || "This field is required",
      },
      options: node.data.options || [],
      optionConnections: node.data.optionConnections || [],
      defaultNextStepId: node.data.defaultNextStepId || null,
      isStart: node.data.isStart || false,
      isEnd: node.data.isEnd || false,
    }));

    const payload = {
      ...flowData,
      steps,
    };

    console.log("Saving flow:", payload);

    try {
      const response = await axios.post(
        `http://localhost:7400/api/auth/bot-config/${id}/${metaCode}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Flow saved successfully!");
      } else {
        alert("Failed to save flow");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save flow");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlowInfoChange = (e) => {
    const { name, value } = e.target
    setFlowData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const selectedNode = nodes.find((node) => node.id === selectedNodeId)

  return (
    <Card className="w-full h-[85vh] overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className="border-b px-4">
          <TabsList className="h-14">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings size={16} />
              <span>Builder</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" onClick={() => setShowPreviewModal(true)}>
              <Play size={16} />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              <span>Flow Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="builder" className="h-full m-0 p-0">
          <div ref={reactFlowWrapper} className="h-full w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader className="animate-spin mr-2" />
                <span>Loading flow...</span>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, node) => handleNodeClick(node.id)}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                  style: { stroke: "#6366f1", strokeWidth: 2 },
                  animated: true,
                }}
              >
                <Background variant="dots" gap={12} size={1} />
                <Controls />
                <MiniMap nodeStrokeColor="#6366f1" nodeColor="#e0e7ff" nodeBorderRadius={2} />

                <Panel position="top-right" className="flex gap-2">
                  <Button onClick={addNewNode} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <PlusCircle size={16} />
                    Add Step
                  </Button>
                  <Button
                    onClick={saveFlow}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="animate-spin mr-1" size={16} /> : <Save size={16} />}
                    Save Flow
                  </Button>
                </Panel>
              </ReactFlow>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="p-4">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Flow Settings</h2>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Flow Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={flowData.name}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                value={flowData.description}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded h-24"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="botId" className="text-sm font-medium">Bot ID</label>
              <input
                type="text"
                id="botId"
                name="botId"
                value={flowData.botId}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="metaCode" className="text-sm font-medium">Meta Code</label>
              <input
                type="text"
                id="metaCode"
                name="metaCode"
                value={flowData.metaCode}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="welcomeMessage" className="text-sm font-medium">Welcome Message</label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={flowData.welcomeMessage}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded h-24"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endMessage" className="text-sm font-medium">End Message</label>
              <textarea
                id="endMessage"
                name="endMessage"
                value={flowData.endMessage}
                onChange={handleFlowInfoChange}
                className="w-full p-2 border rounded h-24"
              />
            </div>

            <Button
              onClick={saveFlow}
              className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loader className="animate-spin mr-1" size={16} /> : <Save size={16} />}
              Save Flow Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {showEditModal && selectedNode && (
        <NodeEditModal
          node={selectedNode}
          onClose={() => setShowEditModal(false)}
          onSave={handleNodeUpdate}
          onDelete={() => deleteNode(selectedNodeId)}
        />
      )}

      {showPreviewModal && (
        <PreviewModal
          nodes={nodes}
          edges={edges}
          welcomeMessage={flowData.welcomeMessage}
          endMessage={flowData.endMessage}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </Card>
  )
}

export default FlowChatbot
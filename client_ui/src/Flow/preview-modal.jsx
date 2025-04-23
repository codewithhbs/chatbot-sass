

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, User, ArrowRight } from "lucide-react"

const PreviewModal = ({ nodes, edges, onClose }) => {
  const [messages, setMessages] = useState([])
  const [currentNodeId, setCurrentNodeId] = useState(null)
  const [userInput, setUserInput] = useState("")
  const [inputType, setInputType] = useState("text")
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState("")
  const [userResponses, setUserResponses] = useState({}) 
  const scrollAreaRef = useRef(null)

 
  useEffect(() => {
    const startNode = nodes.find((node) => node.data.isStart) || nodes[0]
    if (startNode) {
      setCurrentNodeId(startNode.id)
      // Use the node's question as the welcome message
      setMessages([{ type: "bot", content: processMessage(startNode.data.question, {}) }])
      setInputType(startNode.data.type)
      if (startNode.data.type === "dropdown") {
        setOptions(startNode.data.options || [])
      }
    }
  }, [nodes])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Process message template with user data
  const processMessage = (message, userData) => {
    // Replace placeholders like {name} with actual user responses
    let processedMessage = message
    Object.keys(userData).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g")
      processedMessage = processedMessage.replace(regex, userData[key])
    })
    return processedMessage
  }

  const findNextNode = (currentId, userResponse) => {
    const currentNode = nodes.find((node) => node.id === currentId)

    // For dropdown nodes, find the edge that matches the selected option
    if (currentNode?.data.type === "dropdown") {
      const optionIndex = currentNode.data.options.indexOf(userResponse)

      // Find all edges from this node
      const nodeEdges = edges.filter((edge) => edge.source === currentId)

      // If we have an edge for this option index, use it
      if (nodeEdges[optionIndex]) {
        return nodes.find((node) => node.id === nodeEdges[optionIndex].target)
      }
    } else {
      // For other node types, just find the first edge
      const edge = edges.find((edge) => edge.source === currentId)
      if (edge) {
        return nodes.find((node) => node.id === edge.target)
      }
    }

    return null
  }

  const handleSendMessage = () => {
    if (inputType === "dropdown") {
      if (!selectedOption) return
      processUserResponse(selectedOption)
    } else {
      if (!userInput.trim()) return
      processUserResponse(userInput)
    }
  }

  const processUserResponse = (response) => {
    // Get the current node to know what question was asked
    const currentNode = nodes.find((node) => node.id === currentNodeId)

    // Store the user's response with the question as the key
    // This creates a key-value pair like { "What is your name?": "John" }
    const responseKey = currentNode.data.question.toLowerCase().includes("name") ? "name" : currentNode.id

    // Update user responses
    const updatedResponses = {
      ...userResponses,
      [responseKey]: response,
    }
    setUserResponses(updatedResponses)

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: response }])

    // Find next node
    const nextNode = findNextNode(currentNodeId, response)

    if (nextNode) {
      setTimeout(() => {
        // Process the next node's question with the user's data
        const processedQuestion = processMessage(nextNode.data.question, updatedResponses)

        setMessages((prev) => [...prev, { type: "bot", content: processedQuestion }])
        setCurrentNodeId(nextNode.id)
        setInputType(nextNode.data.type)

        if (nextNode.data.type === "dropdown") {
          setOptions(nextNode.data.options || [])
        }

        setUserInput("")
        setSelectedOption("")
      }, 500)
    } else {
      // End of flow - show end message
      setTimeout(() => {
        const endMessage = processMessage("Thank you, {name}! We've recorded your responses.", updatedResponses)
        setMessages((prev) => [...prev, { type: "bot", content: endMessage }])
        setCurrentNodeId(null)
      }, 500)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chatbot Preview</DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 mb-4 border rounded-md">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === "bot" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.type === "bot" ? "bg-gray-100 text-gray-800" : "bg-indigo-500 text-white"
                  } p-3 rounded-lg`}
                >
                  {message.type === "bot" ? (
                    <MessageSquare size={18} className="mt-1" />
                  ) : (
                    <User size={18} className="mt-1" />
                  )}
                  <div>{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {currentNodeId && (
          <div className="flex gap-2">
            {inputType === "dropdown" ? (
              <>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSendMessage}>
                  <ArrowRight size={18} />
                </Button>
              </>
            ) : (
              <>
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={`Enter ${inputType}...`}
                  type={
                    inputType === "number"
                      ? "number"
                      : inputType === "date"
                        ? "date"
                        : inputType === "time"
                          ? "time"
                          : "text"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <ArrowRight size={18} />
                </Button>
              </>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {Object.keys(userResponses).length > 0 && (
              <div className="text-xs text-gray-500">Collected data: {JSON.stringify(userResponses)}</div>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PreviewModal

import { useState, useEffect } from "react"
import { X, Trash2, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const NodeEditModal = ({ node, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    stepId: node.data.stepId || "",
    type: node.data.type || "text",
    question: node.data.question || "",
    responseTemplate: node.data.responseTemplate || "",
    validation: {
      required: node.data.validation?.required || false,
      pattern: node.data.validation?.pattern || null,
      errorMessage: node.data.validation?.errorMessage || "This field is required"
    },
    options: node.data.options || [],
    optionConnections: node.data.optionConnections || [],
    defaultNextStepId: node.data.defaultNextStepId || null,
    isStart: node.data.isStart || false,
    isEnd: node.data.isEnd || false
  })
  const [newOption, setNewOption] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith("validation.")) {
      const validationField = name.split(".")[1]
      setFormData(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          [validationField]: type === "checkbox" ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }))
    }
  }

  // Handle option addition
  const addOption = () => {
    if (newOption.trim() !== "" && !formData.options.includes(newOption.trim())) {
      const updatedOptions = [...formData.options, newOption.trim()]
      
      // Also update optionConnections to keep them in sync
      const updatedConnections = [...formData.optionConnections]
      updatedConnections.push({
        optionValue: newOption.trim(),
        nextStepId: null
      })
      
      setFormData(prev => ({
        ...prev,
        options: updatedOptions,
        optionConnections: updatedConnections
      }))
      setNewOption("")
    }
  }

  // Handle option removal
  const removeOption = (index) => {
    const updatedOptions = formData.options.filter((_, i) => i !== index)
    const optionValue = formData.options[index]
    
    // Also remove from optionConnections
    const updatedConnections = formData.optionConnections.filter(
      conn => conn.optionValue !== optionValue
    )
    
    setFormData(prev => ({
      ...prev,
      options: updatedOptions,
      optionConnections: updatedConnections
    }))
  }

  // Ensure isStart and isEnd are mutually exclusive
  useEffect(() => {
    if (formData.isStart && formData.isEnd) {
      setFormData(prev => ({
        ...prev,
        isEnd: false
      }))
    }
  }, [formData.isStart])

  useEffect(() => {
    if (formData.isEnd && formData.isStart) {
      setFormData(prev => ({
        ...prev,
        isStart: false
      }))
    }
  }, [formData.isEnd])

  // Handle node type change
  useEffect(() => {
    // If node type changes to/from dropdown or multiselect, update accordingly
    if (['dropdown', 'multiselect'].includes(formData.type)) {
      // Ensure options exists
      if (!formData.options || formData.options.length === 0) {
        setFormData(prev => ({
          ...prev,
          options: ["Option 1"],
          optionConnections: [{ optionValue: "Option 1", nextStepId: null }]
        }))
      }
    }
  }, [formData.type])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Edit Step</span>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="flex items-center"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
              <Button
                onClick={() => onSave(formData)}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Check className="mr-1 h-4 w-4" />
                Save
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">
              Advanced Settings
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex-1">
              Validation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Step ID</label>
              <input
                type="text"
                name="stepId"
                value={formData.stepId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                
              />
              <p className="text-xs text-gray-500 mt-1">Step ID cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                className="w-full p-2 border rounded h-24"
                placeholder="Enter your question..."
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use {"{response}"} to reference previous answers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Input Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="dropdown">Dropdown</option>
                <option value="multiselect">Multi-select</option>
                <option value="address">Address</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="package">Package</option>
              </select>
            </div>

            {['dropdown', 'multiselect'].includes(formData.type) && (
              <div>
                <label className="block text-sm font-medium mb-1">Options</label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        readOnly
                        className="flex-1 p-2 border rounded bg-gray-50"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                        className="px-2 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      placeholder="Add new option..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addOption()
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={addOption}
                      className="px-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Response Template</label>
              <textarea
                name="responseTemplate"
                value={formData.responseTemplate}
                onChange={handleChange}
                className="w-full p-2 border rounded h-24"
                placeholder="Enter template for storing responses..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use default format. Use {"{value}"} to reference the input value.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Default Next Step ID</label>
              <input
                type="text"
                name="defaultNextStepId"
                value={formData.defaultNextStepId || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Step ID to proceed to by default"
              />
              <p className="text-xs text-gray-500 mt-1">
                Where should this step proceed to by default?
              </p>
            </div>

            {['dropdown', 'multiselect'].includes(formData.type) && (
              <div>
                <label className="block text-sm font-medium mb-1 mb-2">Option Connections</label>
                <div className="space-y-2 border p-3 rounded bg-gray-50">
                  {formData.optionConnections.map((conn, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium w-1/3">{conn.optionValue}:</span>
                      <input
                        type="text"
                        value={conn.nextStepId || ""}
                        onChange={(e) => {
                          const updatedConnections = [...formData.optionConnections]
                          updatedConnections[index] = {
                            ...updatedConnections[index],
                            nextStepId: e.target.value || null
                          }
                          setFormData(prev => ({
                            ...prev,
                            optionConnections: updatedConnections
                          }))
                        }}
                        className="flex-1 p-2 border rounded"
                        placeholder="Step ID to proceed to"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Specify which step to go to when each option is selected
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <label className="text-sm font-medium">Start Node</label>
                <p className="text-xs text-gray-500">This is the first step in the flow</p>
              </div>
              <Switch
                name="isStart"
                checked={formData.isStart}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isStart: checked,
                    isEnd: checked ? false : prev.isEnd
                  }))
                }}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <label className="text-sm font-medium">End Node</label>
                <p className="text-xs text-gray-500">This is the last step in the flow</p>
              </div>
              <Switch
                name="isEnd"
                checked={formData.isEnd}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    isEnd: checked,
                    isStart: checked ? false : prev.isStart
                  }))
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <label className="text-sm font-medium">Required Field</label>
                <p className="text-xs text-gray-500">User must provide a response</p>
              </div>
              <Switch
                name="validation.required"
                checked={formData.validation.required}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({
                    ...prev,
                    validation: {
                      ...prev.validation,
                      required: checked
                    }
                  }))
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Validation Pattern</label>
              <input
                type="text"
                name="validation.pattern"
                value={formData.validation.pattern || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Regular expression for validation"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a regular expression to validate input (optional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Error Message</label>
              <input
                type="text"
                name="validation.errorMessage"
                value={formData.validation.errorMessage}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Custom error message"
              />
              <p className="text-xs text-gray-500 mt-1">
                Message to display when validation fails
              </p>
            </div>

            {formData.type === "number" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Value</label>
                  <input
                    type="number"
                    name="validation.min"
                    value={formData.validation.min || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Minimum value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maximum Value</label>
                  <input
                    type="number"
                    name="validation.max"
                    value={formData.validation.max || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Maximum value"
                  />
                </div>
              </div>
            )}

            {["date", "time"].includes(formData.type) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Earliest Allowed</label>
                  <input
                    type={formData.type}
                    name="validation.min"
                    value={formData.validation.min || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latest Allowed</label>
                  <input
                    type={formData.type}
                    name="validation.max"
                    value={formData.validation.max || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default NodeEditModal
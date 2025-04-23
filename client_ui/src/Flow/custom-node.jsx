"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { FileText, Hash, Calendar, Clock, List, MessageSquare } from "lucide-react"

const typeIcons = {
  text: <FileText size={14} />,
  number: <Hash size={14} />,
  date: <Calendar size={14} />,
  time: <Clock size={14} />,
  dropdown: <List size={14} />,
}

const CustomNode = ({ data, id, onNodeClick }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md min-w-[220px] cursor-pointer transition-all duration-200 hover:shadow-lg ${
        data.isStart ? "bg-indigo-100 border-2 border-indigo-500" : "bg-white border border-gray-200"
      }`}
      onClick={() => onNodeClick(id)}
    >
      {data.isStart && (
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
          Start
        </div>
      )}

      <div className="flex items-center gap-2 font-medium text-gray-800 mb-1">
        {data.isStart ? (
          <MessageSquare size={16} className="text-indigo-600" />
        ) : (
          typeIcons[data.type] || <FileText size={16} />
        )}
        <span className="truncate">{data.question || "Untitled Step"}</span>
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-2">
        <span className="px-1.5 py-0.5 bg-gray-100 rounded">{data.type}</span>

        {data.validation?.required && (
          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
        )}
      </div>

      {data.type === "dropdown" && data.options?.length > 0 && (
        <div className="mt-2 border-t pt-2 border-gray-100">
          <div className="text-xs font-medium text-gray-600 mb-1">Options:</div>
          <ul className="text-xs text-gray-500 space-y-1">
            {data.options.map((opt, i) => (
              <li key={i} className="flex items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                {opt}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
    </div>
  )
}

export default memo(CustomNode)

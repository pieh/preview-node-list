import React, { useContext, useEffect } from "react"
import { FaEdit } from "react-icons/fa"

export const PreviewHelperContext = React.createContext({})

export const PreviewNodeHelper = ({ id, children }) => {
  const { hovered, setHovered, registerHelper, nodesMap } = useContext(
    PreviewHelperContext
  )
  useEffect(() => {
    registerHelper(id)
  }, [id, registerHelper])

  const nodeData = nodesMap[id]

  const isHovered = hovered === id
  const color = isHovered ? "#f5e9e9" : "#c7c7c7"

  return nodeData ? (
    <div
      style={{
        border: `1px solid ${color}`,
        position: `relative`,
      }}
      onMouseEnter={() => {
        if (hovered !== id) {
          setHovered(id)
        }
      }}
      onMouseLeave={() => {
        if (hovered === id) {
          setHovered(null)
        }
      }}
    >
      {isHovered && (
        <div
          style={{
            fontFamily: `monospace`,
            position: `absolute`,
            bottom: `100%`,
            // marginBottom: -1,
            background: color,
            color: `black`,
            width: `100%`,
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: "center",
            cursor: nodeData.file ? `pointer` : `default`,
          }}
          onClick={() => {
            if (nodeData.file) {
              window.fetch(
                `/__open-stack-frame-in-editor?fileName=` +
                  window.encodeURIComponent(nodeData.file)
              )
            }
          }}
        >
          <div>
            [{nodeData.type}] {nodeData.description || nodeData.originalNodeId}
          </div>
          <FaEdit
            style={{
              marginRight: 5,
              verticalAlign: `middle`,
              color: nodeData.file ? `#7880e6` : `#c7c7c7`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  ) : null
}

import React, { useContext, useEffect } from "react"
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
  const color = isHovered ? "blue" : "#c7c7c7"

  return nodeData ? (
    <div
      style={{
        border: `1px solid ${color}`,
        position: `relative`,
      }}
      onMouseOver={() => {
        if (hovered !== id) {
          setHovered(id)
        }
      }}
      onMouseOut={() => {
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
            background: color,
            color: `white`,
          }}
        >
          [{nodeData.type}] {nodeData.description || nodeData.originalNodeId}
        </div>
      )}
      {children}
    </div>
  ) : null
}

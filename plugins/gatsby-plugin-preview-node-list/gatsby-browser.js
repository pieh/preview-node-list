import React, { useLayoutEffect, useState, useContext, useReducer } from "react"
import { createClient } from "urql"
import { FaEye } from "react-icons/fa"

import { PreviewHelperContext } from "./"

const client = createClient({ url: "/__graphql" })

const Overlay = ({ path }) => {
  const {
    hovered,
    setHovered,
    renderedHelpers,
    clearRenderedHelpers,
    nodes,
    setNodes,
  } = useContext(PreviewHelperContext)

  useLayoutEffect(() => {
    clearRenderedHelpers()
    setNodes([])
    setHovered(null)

    client
      .query(
        `query GetEditableNodes($path: String!) {
          _editableNodesOnPage(path: $path)
        }`,
        {
          path,
        }
      )
      .toPromise()
      .then(result => {
        if (result.error) {
          setNodes([])
          return
        }

        setNodes(result.data._editableNodesOnPage.nodeIds)
      })
  }, [path])

  if (!nodes.length > 0) {
    return <React.Fragment />
  }

  return (
    <div
      style={{
        position: `fixed`,
        bottom: 50,
        right: 50,
        background: `white`,
        boxShadow: `0px 0px 5px 0px rgba(0,0,0,0.25)`,
        padding: `15px 0`,
        fontFamily: `monospace`,
      }}
    >
      {nodes.map(nodeData => {
        const isRenderedInPreview = renderedHelpers.includes(
          nodeData.originalNodeId
        )

        return (
          <div
            onMouseOver={() => {
              if (hovered !== nodeData.originalNodeId) {
                setHovered(nodeData.originalNodeId)
              }
            }}
            onMouseOut={() => {
              if (hovered === nodeData.originalNodeId) {
                setHovered(null)
              }
            }}
            key={nodeData.id}
            style={{
              padding: `0 15px`,
              background:
                hovered === nodeData.originalNodeId ? `#f5e9e9` : `inherit`,
            }}
          >
            <FaEye
              style={{
                marginRight: 5,
                verticalAlign: `middle`,
                color: isRenderedInPreview ? `#2cc32c` : `#c7c7c7`,
              }}
            />
            [{nodeData.type}] {nodeData.description || nodeData.originalNodeId}
          </div>
        )
      })}
    </div>
  )
}

// const renderedHelpersReducer = state
function renderedHelpersReducer(state, action) {
  switch (action.type) {
    case "REGISTER": {
      if (!state.includes(action.payload)) {
        return [...state, action.payload]
      }

      return state
    }
    case "RESET": {
      return []
    }
  }
  return state
}

const Wrapper = ({ children, ...props }) => {
  const [nodes, _setNodes] = useState([])
  const [nodesMap, setNodesMap] = useState({})
  const [hovered, setHovered] = useState(null)
  const [renderedHelpers, dispatch] = useReducer(renderedHelpersReducer, [])

  const registerHelper = id => {
    dispatch({ type: `REGISTER`, payload: id })
  }

  const clearRenderedHelpers = () => {
    dispatch({ type: `RESET` })
  }

  const setNodes = nodes => {
    _setNodes(nodes)
    setNodesMap(
      nodes.reduce((acc, nodeData) => {
        acc[nodeData.originalNodeId] = nodeData
        return acc
      }, {})
    )
  }

  return (
    <PreviewHelperContext.Provider
      value={{
        hovered,
        setHovered,
        registerHelper,
        clearRenderedHelpers,
        renderedHelpers,
        nodes,
        setNodes,
        nodesMap,
      }}
    >
      {children}
      <Overlay {...props} />
    </PreviewHelperContext.Provider>
  )
}

export const wrapPageElement = ({ element, props }) => {
  return <Wrapper {...props}>{element}</Wrapper>
}

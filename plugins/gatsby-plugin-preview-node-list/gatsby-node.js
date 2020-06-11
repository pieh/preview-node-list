const path = require(`path`)

const isEditableNodePredicate = node => {
  return !node.parent
}

exports.createResolvers = ({ createResolvers, store, getNode }) => {
  createResolvers({
    Query: {
      _editableNodesOnPage: {
        type: `JSON`,
        args: {
          path: {
            type: `String!`,
          },
        },
        resolve: (source, args, context, info) => {
          const { componentDataDependencies, program } = store.getState()

          const usedNodesIds = new Set()
          componentDataDependencies.nodes.forEach((pathSet, nodeId) => {
            if (pathSet.has(args.path)) {
              usedNodesIds.add(nodeId)
            }
          })

          // we have all used nodes - now let's try to find top level ones (for example used nodes can be Mdx, but we do want to edit File which is a parent node)
          const editableNodes = new Set()
          usedNodesIds.forEach(nodeId => {
            const originalNodeId = nodeId
            while (nodeId) {
              const node = getNode(nodeId)

              if (isEditableNodePredicate(node)) {
                const editable = {
                  id: node.id,
                  originalNodeId,
                  type: node.internal.type,
                  description: node.internal.description,
                }

                // --- This should be somehow defined in plugins that create those types
                if (editable.type === `File`) {
                  editable.file = node.absolutePath
                } else if (editable.type === `Site`) {
                  const gatsbyConfigPath = path.join(
                    program.directory,
                    `gatsby-config.js`
                  )
                  editable.file = gatsbyConfigPath
                }

                editableNodes.add(editable)
                return
              }

              nodeId = node.parent
            }
          })

          // console.log({ source, args })
          // debugger
          return {
            nodeIds: Array.from(editableNodes),
          }
        },
      },
    },
  })
}

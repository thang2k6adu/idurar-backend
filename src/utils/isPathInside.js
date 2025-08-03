const path = require('path')

// is implementation of is-path-inside npm package

export const isPathInside = (childPath, parentPath) => {
  const relation = path.relative(parentPath, childPath)

  return Boolean(
    relation && relation !== '..' && !relation.startsWith(`..${path.sep}`) && relation !== path.resolve(childPath)
  )
}

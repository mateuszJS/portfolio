const path = require('path')
const fs = require('fs')

// const regexTsUniform = /interface *IUniform *{\n([^\}]*)}/
// const regexTsAttribute = /interface *IAttribute *{\n((.|\n)*)}/

const regexGlUniform = /uniform (.+)/g
const regexGlAttribute = /attribute (.+)/g

const regexSetters = /  set .*\n(    .*\n)  }/g

const mapGlslToTypescript = {
  'vec2': 'vec2',
  'vec3': 'vec3',
  'vec4': 'vec4',
  'float': 'number',
  'sample2D': 'vec2',
  'sampler2D': 'number',
  'mat3': 'Matrix3',
  'mat4': 'Float32Array',
}

const mapGlslToFunc = {
  'sampler2D': 'uniform1i',
  'sample2D': 'uniform2i',
  'vec4': 'uniform4f',
  'vec3': 'uniform3f',
  'vec2': 'uniform2f',
  'float': 'uniform1f',
  'mat3': 'uniformMatrix3fv',
  'mat4': 'uniformMatrix4fv',
}

const defaultSetterData = {
  propertyName: undefined,
  parameterType: undefined,
  typeOfGlFunction: undefined
}
const getSetterData = (result, lineOfText) => {
  const setterPropertyName = lineOfText.match(/set ([_a-zA-Z0-9]*)/)
  const setterParameterType = lineOfText.match(/set [_a-zA-Z0-9]* ?\([_a-zA-Z0-9]*: ?([_a-zA-Z0-9]*)\)/)
  const typeOfGlFunction = lineOfText.match(/gl\.([_a-zA-Z0-9]*)\(/)
  return {
    propertyName: setterPropertyName ? setterPropertyName[1] : result.propertyName,
    parameterType: setterParameterType ? setterParameterType[1] : result.parameterType,
    typeOfGlFunction: typeOfGlFunction ? typeOfGlFunction[1] : result.typeOfGlFunction
  }
}

const getClassSetters = (source) => {
  try {
    const setters = source.match(regexSetters)
    if (!setters || setters.length === 0) {
      return []
    }
    return setters.map(setter => {
      const linesOfSetter = setter.split('\n')
      return linesOfSetter.reduce(getSetterData, defaultSetterData)
    })
  } catch ({ message }) {
    throw new Error(`#Class definition => ${message}`)
  }
}

const getWebGlProps = (source, regex) => {
  try {
    const sourcePart = source.match(regex)
    if (!sourcePart) {
      return {}
    }
    const propsObject = sourcePart.reduce((result, singleLine) => {
      const wordsInLine = singleLine.substring(0, singleLine.length - 1).split(' ')
      return {
        ...result,
        [wordsInLine[2]]: wordsInLine[1]
      }
    }, {})

    return propsObject
  } catch ({ message }) {
    throw new Error(`#GLSL types definition =>#${message}`)
  }
}

const validateSetter = (glslTypes, setterData) => {
  const {
    parameterType,
    propertyName,
    typeOfGlFunction
  } = setterData

  const glslType = glslTypes[propertyName]
  const correctTsType = mapGlslToTypescript[glslType]
  const correctFunc = mapGlslToFunc[glslType]
  const typeIsMached = correctTsType === parameterType
  const funcIsMached = correctFunc === typeOfGlFunction
  
  if (!glslType) {
    return // NOTE: there are two glsl files to one ts file
  }
  if (!typeIsMached) {
    throw new Error(`Prop name: "${propertyName}" =>#Type in TypeScript "${parameterType}" is not corresponding to type in GLSL "${glslType}".#Hint: Correct TypeScript type is "${correctTsType}".`)
  }
  if (!funcIsMached) {
    throw new Error(`Prop name: "${propertyName}" =>#Type of setter in TypeScript "${typeOfGlFunction}" is incorrect.#Hint: Correct setter is  "${correctFunc}".`)
  }
}

const validateAllExistingSetters = (glslTypes, allSettersData) => {
  for (let setterData of allSettersData) {
    validateSetter(glslTypes, setterData)
  }
}

const validateAllSetters = (glslTypes, allSettersData) => {
  try {
    validateAllExistingSetters(glslTypes, allSettersData)
  } catch ({ message }) {
    throw new Error(`#Uniforms =>#${message}`)
  }

  // const isEqualNumberOfTypes = Object.keys(glslTypes).length === allSettersData.length // when tsTypes has more types than glslTypes
  // if (!isEqualNumberOfTypes) {
  //   const additionalProps = Object.keys(glslTypes).reduce((result, glslPropertyName) => {
  //     const isTsCodeExists = allSettersData.find(({ propertyName }) => propertyName === glslPropertyName)
  //     if (!isTsCodeExists) {
  //       return [...result, glslPropertyName]
  //     }
  //     return result
  //   }, [])
  //   throw new Error(`#Uniforms =>#Props: "${additionalProps.join(', ')}" exist in GLSL interface, but not in TypeScript.`)
  // }
  return true
}

const areAllTypesValid = (glslContent, tsContent) => {
  try {
    const classSetters = getClassSetters(tsContent)
    const uniformGlsl = getWebGlProps(glslContent, regexGlUniform)
    const attributeGlsl = getWebGlProps(glslContent, regexGlAttribute)
    debugger
    const glslProperties = Object.assign(uniformGlsl, attributeGlsl)
    validateAllSetters(glslProperties, classSetters)
    // TODO: handle varying
  } catch ({ message }) {
    throw new Error(message)
  }
}

module.exports = function (glslContent, map, meta) {
  const callback = this.async()
  // const nameOfShader = glslContent.match(regexImport)
  
  const relativePath = this.resourcePath.replace(`${this.rootContext}/`, '')
  // if (!nameOfShader || !nameOfShader[1]) {
  //   const err = new Error(
  //     `\nInvalid import of TS's file with class definition: ${relativePath}\n`
  //   )
  //   return callback(err)
  // }
  
  const directory = this.context.replace(`${this.rootContext}/`, '')
  const pathToClassFile = `${directory}/program.ts`
  const fileWithTypes = path.resolve(pathToClassFile)


  fs.readFile(fileWithTypes, 'utf-8', function (err, tsContent) {
    if (err && err.code === 'ENOENT') {
      const error = new Error(
        `File "${relativePath}" =>#cannot find file with types "${err.path}"`
      )
      return callback(error)
    } else if (err) {
      return callback(err)
    }

    try {
      areAllTypesValid(glslContent, tsContent)
    } catch ({ message }) {
      let indent = 2
      let messageWithLineBreaks = '';

      for (let i = 0; i < message.length; i++) {
        const letter = message[i]
        if (letter === '#') {
          const lineBreaks = Array.from({ length: indent }, () => '  ').join('')
          messageWithLineBreaks += `\n${lineBreaks}`
          indent++
        } else {
          messageWithLineBreaks += letter
        }
      }
      return callback(new Error(`\nGLSL file: "${relativePath}" =>\n  import class declaration: "${pathToClassFile}"${messageWithLineBreaks}\n`))
    }

    // const contentWithoutImport = glslContent.replace(regexImport, '')
    callback(this.context, glslContent, map, meta)
  })
}

export function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, char) => {
    return char.toUpperCase()
  })
}

export function toKebabCase(str: string): string {
  return str.replace(/_/g, '-').toLowerCase()
}

export function toPascalCase(str: string): string {
  return str.replace(/(\w)(\w*)/g, (_, firstChar, restOfString) => {
    return firstChar.toUpperCase() + restOfString.toLowerCase()
  })
}

const fs = require('fs')

const imageFileNames = () => {
  const array = fs
    .readdirSync('App/Images')
    .filter(file => {
      return file.endsWith('.png') || file.endsWith('.gif')
    })
    .map(file => {
      return file.replace('@2x.png', '.png').replace('@3x.png', '.png').replace('@1x.png', '.png')
    })

  return [...new Set(array)]
}

const generate = () => {
  const properties = imageFileNames()
    .map(name => {
      return `  '${name.replace('.png', '').replace('.gif', '')}' : require('@images/${name}')`
    })
    .join(',\n')

  const string = `// This is auto-generated file. DO NOT EDIT. To update run yarn images.

const images = {
${properties}
}
export default images
`

  fs.writeFileSync('App/Themes/Images.ts', string, 'utf8')
}

generate()

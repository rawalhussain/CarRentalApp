const fs = require('fs')
const { readFileSync, readdirSync, writeFileSync, unlinkSync } = fs

const files = readFileSync('./scripts/transformInterceptor.txt').toString().split('\n')
const hash = {}

const filtered = files.filter(file => !file.startsWith('node_modules'))
filtered.forEach(file => {
  hash['./' + file] = true
})

const IGNORE = '.DS_Store'

function dir(path) {
  let localDir = readdirSync(path)
  localDir.forEach(f => {
    if (f != IGNORE) {
      if (f.includes('.')) {
        if (!hash[path + '/' + f] && !f.endsWith('.png')) {
          unlinkSync(path + '/' + f)
        }
      } else {
        dir(path + '/' + f)
      }
    }
  })
}

dir('./App')

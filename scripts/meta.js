import { writeFile } from 'fs/promises'

const target = "meta.json"

const timestamp = new Date()

const json = JSON.stringify({ updated: timestamp })

writeFile(target, json)
    .then(() => console.log(target))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

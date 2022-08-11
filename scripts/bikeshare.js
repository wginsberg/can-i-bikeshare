import fs from 'fs'

const API_URL = "https://bikeshare-research.org/api/v1/systems/toronto"
const TARGET = "./bikeshare.json"

const target = process.argv.length >= 3
    ? process.argv[2]
    : TARGET

await fetch(API_URL)
    .then(res => res.text())
    .then(data => fs.writeFileSync(target, data))
    .then(() => console.log(target))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

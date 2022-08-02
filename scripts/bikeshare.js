import fs from 'fs'

const API_URL = "https://bikeshare-research.org/api/v1/systems/toronto"
const target = "./bikeshare.json"

await fetch(API_URL)
    .then(res => res.text())
    .then(data => fs.writeFileSync(target, data))
    .then(() => console.log(target))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

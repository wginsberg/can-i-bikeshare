import fs from 'fs'

const API_URL = "https://bikeshare-research.org/api/v1/systems/toronto"
const TARGET = "./bikeshare.json"

const target = process.argv.length >= 3
    ? process.argv[2]
    : TARGET

await fetch(API_URL)
    .then(res => res.text())
    .then(text => JSON.parse(text))
    .then((json) => {
         // discard unused fields
        const stations = json.stations.map(({ stnid, lat, lng, name}) => ({
            stnid,
            lat,
            lng,
            name
        }))
        return { stations }
    })
    .then(json => JSON.stringify(json, null, 4))    // pretty print json
    .then(data => fs.writeFileSync(target, data))
    .then(() => console.log(target))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

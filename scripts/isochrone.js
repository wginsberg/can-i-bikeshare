import { access, readFile, writeFile } from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

const API_URL = "https://api.openrouteservice.org/v2/isochrones/cycling-regular"
const source = "bikeshare.json"
const target = "isochrones.json"

if (process.argv.length !== 4) {
    console.error('Usage: npm run get-isochrone <start> <end>\n')
    console.error('E.g. download the first 20 stations:\n\tnpm run get-isochrone 0 20')
    process.exit(1)
}

const [rangeStart, rangeEnd] = process.argv.slice(2, 4).map(s => Number(s))
const range = rangeEnd - rangeStart

/*
* Get data for a single station
*/
async function getIsochrone({ lat, lng }) {
    const fetchBody = {
        locations: [[lng, lat]],
        range: [0, 1800],
        range_type: 'time'
    }
    const fetchOptions = {
        method: 'POST',
        body: JSON.stringify(fetchBody),
        headers: {
            'Authorization': process.env.ORS_KEY,
            'Content-Type': 'application/json; charset=utf-8'
        }
    }

    return fetch(API_URL, fetchOptions)
}

async function processStation(station) {
    const { stnid } = station
    const { lat, lng } = station

    const defaultIsochrones = {}
    const targetExists = await access(target)
        .then(() => true)
        .catch(() => {
            console.info(target)
            return false
        })

    const existingIsochrones = targetExists
        ? await readFile(target)
            .then(data => JSON.parse(data))
            .catch(err => {
                console.error(err)
                process.exit(1)
            })
        : defaultIsochrones

    await getIsochrone({ lat, lng })
        .then(res => res.json())
        .then(json => json.features[0].geometry.coordinates[0])
        .then(iso => ({
            ...existingIsochrones,
            [stnid]: { lat, lng, iso }
        }))
        .then(json => JSON.stringify(json))
        .then(text => writeFile(target, text))
        .catch(err => {
            console.error(err)
            process.exit(1)
        })
}

const bikeshareData = await readFile(source)
    .then(raw => JSON.parse(raw))
    .then(({ stations }) => stations)
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

// Fetch 20 items/minute to stay below API rate limit
for (let i = 0; i < range / 20; i++) {
    const start = rangeStart + i * 20
    const end = rangeStart + (i + 1) * 20
    console.log(`------------ FETCHING station range ${start} - ${end} ------------`)
    for(const station of bikeshareData.slice(start, end)) {
        console.info(station)
        await processStation(station)
        console.log('.')
    }

    console.log('waiting 60s ...')
    await new Promise(resolve => setTimeout(resolve, 60 * 1000))
}

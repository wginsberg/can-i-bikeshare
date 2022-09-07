import { access, readFile, writeFile } from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

const API_URL = "https://api.openrouteservice.org/v2/isochrones/cycling-regular"
const target = "isochrones.json"

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
        .then(res => {
            if (!res.ok) throw new Error(res.statusText)
            return res
        })
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

async function fetchIsochrones(stations = []) {
    if (stations.length === 0) return

    // Fetch 20 items/minute to stay below API rate limit
    const batches = Math.ceil(stations.length / 20)

    for (let i = 0; i <= batches; i++) {
        const start = i * 20
        const end = (i + 1) * 20
        const batch = stations.slice(start, end)

        if (batch.length === 0) continue

        if (i > 0) {
            console.log('waiting 60s ...')
            await new Promise(resolve => setTimeout(resolve, 60 * 1000))
        }

        console.log(`fetching stations ${start} - ${end}`)
        for(const station of batch) {
            console.info(station)
            await processStation(station)
            console.log('')
        }
    }
}

export { fetchIsochrones }

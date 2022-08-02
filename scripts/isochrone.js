import { access, readFile, writeFile } from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

const API_URL = "https://api.openrouteservice.org/v2/isochrones/cycling-regular"
const source = "bikeshare.json"
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
            // 'Accept': 'application/json',
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
        .then(json => ({
            ...existingIsochrones,
            [stnid]: {
                ...station,
                isochrone: json
            }
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

// 0, 20  ✅
// 20, 40 ✅
// 40, 60 ✅
// 60, 80 ✅
// 80, 100 ✅
// 100, 120 ✅

// 120, 320 ✅

// 320, 440

for (let i = 0; i < 6; i++) {
    const start = 320 + (20 * i)
    const end = 340 + (20 * i)
    console.log(`------------ FETCHING station range ${start} - ${end} ------------`)
    for(const station of bikeshareData.slice(start, end)) {
        console.info(station)
        await processStation(station)
        console.log('.')
    }

    console.log('waiting 60s ...')
    await new Promise(resolve => setTimeout(resolve, 60 * 1000))
}

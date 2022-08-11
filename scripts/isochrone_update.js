import { access, readFile } from 'fs/promises'
import { fetchIsochrones } from './isochrone.js'
import { deepStrictEqual } from 'assert/strict'

const sourceVersioned = "bikeshare.json"
const sourceTemp = "bikeshare_temp.json"

const sourceExists = await access(sourceTemp)
    .then(() => true)
    .catch(() => false)

if (!sourceExists) {
    console.error(`Could not find ${sourceTemp} \n`)
    process.exit(1)
}

// Read the bikeshare.json file under version control
const versioned = await readFile(sourceVersioned)
    .then(raw => JSON.parse(raw))
    .then(({ stations }) => stations)
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

// Read the temporary bikeshare_temp.json file
const temp = await readFile(sourceTemp)
    .then(raw => JSON.parse(raw))
    .then(({ stations }) => stations)
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

// Fetch isochrone data and update isochrones.json
const stations = getStationsToProcess(versioned, temp)
console.log(stations)
fetchIsochrones(stations)

/*
    Util functious
*/

function getNewStations(versioned, temp) {
    const versionedStnids = new Set(versioned.map(({ stnid }) => stnid))
    const newStations = temp.filter(({ stnid }) => !versionedStnids.has(stnid))
    return newStations
}

function getUpdatedStations(versioned, temp) {
    const versionedObj = versioned.reduce((acc, cur) => ({ ...acc, [cur.stnid]: cur }), {})
    const updatedStations = temp.filter(station => {
        const { stnid } = station
        const existingStation = versionedObj[stnid]
        if (!existingStation) return false
        let didChange = true
        try {
            deepStrictEqual(station, existingStation)
            didChange = false
        } finally {
            return didChange
        }
    })

    return updatedStations
}

function getStationsToProcess(versioned, temp) {
    const stnids = new Set()
    const toProcess = []

    const newStations = getNewStations(versioned, temp)
    const updatedStations = getUpdatedStations(versioned, temp)
    const allStations = [...newStations, ...updatedStations]

    for (const station of allStations) {
        const { stnid } = station
        if (stnids.has(stnid)) continue
        stnids.add(stnid)

        toProcess.push(station)
    }

    return toProcess
}

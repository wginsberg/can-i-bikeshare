import { access, readFile, writeFile } from 'fs/promises'
import pointInPolygon from 'point-in-polygon'

const source = "isochrones.json"
const target = "distance.json"

const stations = await readFile(source)
    .then(raw => JSON.parse(raw))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

const distance = {}

for (const station in stations) {
    console.log(station, stations[station].name)
    
    const polygon = stations[station].isochrone.features[0].geometry.coordinates[0]

    // Find stations inside this polygon
    const inPolygon = Object.keys(stations)
        .filter(otherStation => otherStation !== station)
        .filter(otherStation => {
            const {lat, lng} = stations[otherStation]
            const isInPolygon = pointInPolygon([lng, lat], polygon)
            return isInPolygon
        })
    
    console.log(inPolygon.map(id => stations[id].name))
    console.log(inPolygon.length)
    console.log('.')

    distance[station] = inPolygon
}

await writeFile(target, JSON.stringify(distance))
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

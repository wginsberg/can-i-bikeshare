import { readFile } from 'fs/promises'
import { fetchIsochrones } from './isochrone.js'

const source = "bikeshare.json"

if (process.argv.length !== 4) {
    console.error('Usage: npm run get-isochrone <start> <end>\n')
    console.error('E.g. download the first 20 stations:\n\tnpm run get-isochrone 0 20')
    process.exit(1)
} 

const [rangeStart, rangeEnd] = process.argv.slice(2, 4).map(s => Number(s))

const bikeshareData = await readFile(source)
    .then(raw => JSON.parse(raw))
    .then(({ stations }) => stations)
    .catch(err => {
        console.error(err)
        process.exit(1)
    })

fetchIsochrones(bikeshareData.slice(rangeStart, rangeEnd))

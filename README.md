## Running the project

Just run the app:
```
./server.py
```

## Updating the dataset

### Prerequisites

1. Get an API key from https://openrouteservice.org/
2. Create the following `.env` file:
    ```
    ORS_KEY=<your api key>
    ```
3. Install dependencies:
    ```
    npm install
    ```

### Updating Bikeshare data incrementally

To keep data in the repo in sync with the latest [changes to the Bikeshare network](https://bikesharetoronto.com/network-info/):

```
npm run update
```

### Building dataset from scratch

Due to limitations with the Open Route Service API, building the dataset from scratch may need to be done over multiple days.

1. Fetch bikeshare data
    ```
    npm run get-bikeshare
    ```
4. Get isochrone data for each dock.
    ```
    npm run get-isochrone
    ```
5. Get distance data. This script will check the point-in-polygon inclusion for every dock's 30 minute isochrone against every other dock.
    ```
    npm run get-distance
    ```

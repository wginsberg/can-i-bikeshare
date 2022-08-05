## Running the project

Just run the app:
```
./server.py
```

## Building the project

All the needed data is already in this repo under version control! No database to worry about :)

To generate the data from scratch:
1. Get an API key from https://openrouteservice.org/
2. Create the following `.env` file:
    ```
    ORS_KEY=<your api key>
    ```
3. Get bikeshare data
    ```
    npm run get-bikeshare
    ```
4. Get isochrone data. Note that due to rate limiting, the data will have to be retrieved over at least two days.
    ```
    npm run get-isochrone
    ```
5. Get distance data. This script will check the point-in-polygon inclusion for every pair of stations
    ```
    npm run get-distance
    ```


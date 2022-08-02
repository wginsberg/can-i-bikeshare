1. Get an API key from https://openrouteservice.org/
2. Create the following `.env` file:
    ```
    ORS_KEY=<your api key>
    ```

## TODO
* Reduce size of `isochrones.json` by discarding unused fields from ORS responses
* Verify discontinuos isochrones are handled (i.e. stations near don valley)
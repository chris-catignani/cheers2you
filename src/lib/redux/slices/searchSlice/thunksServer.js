import beerLists from '../beersSlice/data/beer_lists.json';


/**
 * This file has beer search functionality like it would be on a server.
 * Allowing us to hopefully make that cut a bit cleaner later
 */

const stall = async (stallTime = 100) => {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

export const pretendServerGetVenues = async () => {
    await stall()

    return beerLists.map( beerList => {
        return {
            venueName: beerList.venueName,
            venueUrl: beerList.urlParam,
        }
    })
}

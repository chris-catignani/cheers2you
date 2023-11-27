import { setEventName, setPersonsName } from "./beerBannerSlice";

export const generateBeerBanner = (personsName, eventName) => (dispatch, getState) => {
    dispatch(setEventName(eventName));
    dispatch(setPersonsName(personsName));
}
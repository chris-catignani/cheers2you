export const setInSessionStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value)
    }
}

export const getFromSessionStorage = (key, fallback) => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key) || fallback
    }
    return fallback
}

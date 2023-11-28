export const wrapIndex = (min, max, v) => {
    const rangeSize = max - min
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export const isAtoZ = (letter) => {
    return /^[a-zA-Z]+$/.test(letter)
}

export const getSocialMediaShareUrl = (fileId) => {
    return 'https://cheers2you.vercel.app/shared/' + fileId
}

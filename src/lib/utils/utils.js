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

export const getSocialMediaImageUrl = (fileId) => {
    return `https://upcdn.io/W142hJk/raw/demo/${fileId}.jpeg`
}

export const convertImageToBase64 = async (imageUrl) => {

    const _convertImageToBase64 = async (imageUrl, callback) => {
        const image = await fetch(imageUrl)
        const blob = await image.blob()

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            callback(base64data)
        };
    }

    return new Promise(resolve => _convertImageToBase64(imageUrl, resolve))
}


export function nodeBufferToBlobURL(buffer, mimetype, filename="file"){
    let file = new File([Uint8Array.from(buffer)], filename, {type: mimetype})
    return URL.createObjectURL(file)
}
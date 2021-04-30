/*
    Node Buffer type is an object that contains a plain array of binary data (.data)
    We create a file object from this data with the specified filename and mime-type
    And return it as a blob. 
*/
export function nodeBufferToBlobURL(buffer, mimetype, filename="file"){
    let file = new File([Uint8Array.from(buffer.data)], filename, {type: mimetype})
    return URL.createObjectURL(file)
}

/*
    Node Buffer type is an object that contains a plain array of binary data (.data)
    We create a file object from this data with the specified filename and mime-type
*/
export function nodeBufferToFile(buffer, mimetype, filename="file"){
    return new File([Uint8Array.from(buffer.data)], filename, {type: mimetype})
}
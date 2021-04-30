/*
	ObjectId: https://docs.mongodb.com/manual/reference/method/ObjectId/
	String representation of ObjectId is in hex, so we have 24 hex characters
	The first 4 bytes (8 hex characters) is a timestamp in seconds from Unix epoch
	We take the first 4 bytes (8 hex characters), convert it to Number with radix 16
	Multiply by 1000 to get milliseconds since epoch for Date constructor
*/
export let dateFromObjectId = function (objectId) {
	return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
};


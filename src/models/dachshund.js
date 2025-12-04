const { getDB } = require('../data/connection');
const { ObjectId } = require('mongodb');

const COLLECTION = 'dachshunds';

function buildIdQuery(id) {
	// Accept ObjectId hex strings, Buffer/Uint8Array, or plain values (string/number)
	if (ObjectId.isValid(id)) {
		try {
			return { _id: new ObjectId(id) };
		} catch (e) {
			// fall through to use raw id
		}
	}
	return { _id: id };
}

async function getAllDachshunds(filter = {}, sort = null) {
	const db = getDB();
	let cursor = db.collection(COLLECTION).find(filter);
	if (sort && Object.keys(sort).length) {
		cursor = cursor.sort(sort);
	}
	const docs = await cursor.toArray();
	return docs;
}

async function getDachshundById(id) {
	const db = getDB();
	const query = buildIdQuery(id);
	return db.collection(COLLECTION).findOne(query);
}

async function addDachshund(dachshund) {
	const db = getDB();
	const result = await db.collection(COLLECTION).insertOne(dachshund);
	return result.insertedId;
}

async function updateDachshund(id, update) {
	const db = getDB();
	const query = buildIdQuery(id);
	const res = await db.collection(COLLECTION).updateOne(query, { $set: update });
	return res.modifiedCount > 0;
}

async function deleteDachshund(id) {
	const db = getDB();
	const query = buildIdQuery(id);
	const res = await db.collection(COLLECTION).deleteOne(query);
	return res.deletedCount > 0;
}

module.exports = {
	getAllDachshunds,
	getDachshundById,
	addDachshund,
	updateDachshund,
	deleteDachshund
};


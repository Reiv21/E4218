const {MongoClient} = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('dachshundDB');
        console.log('Polaczono z bazą danych MongoDB');
    } catch (error) {
        console.error('Błąd połączenia z bazą danych MongoDB:', error);
    }
}

function getDB() {
    if (!db) {
        throw new Error('Baza danych nie jest połączona. Upewnij się, że connectDB() zostało wywołane.');
    }
    return db;
}

module.exports = {connectDB, getDB};
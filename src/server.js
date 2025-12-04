const app = require('./app');
const { connectDB } = require('./data/connection');

const PORT = 3000;

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Nie udało się uruchomić serwera:', err);
        process.exit(1);
    }
})();
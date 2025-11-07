const express = require('express');
const mysql = require('mysql2/promise')
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());

async function connectDB() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'mysql12345',
        database: 'url_shortener'
    });
    console.log("✔️  MySQL successfully connected")
    return connection;
}

app.get('/', async(req, res) => {
    res.send("✔️ Backend successfully connected");
});

app.get('/urls', async(req, res) => {
    try {
        const [rows] = await db.execute('select * from urls');
        res.json(rows);
    } catch(err) {
        console.error('❌ Errors fetching URLs:', err);
        res.status(500).json({error: "Failed to fetch URLs"});  
    }
});

app.post('/shorten', async(req, res) => {
    try {
    const {longUrl} = req.body;
    if(!longUrl) {
        return res.status(400).json({error: 'longUrl is required'});
    }
    const shortCode = nanoid(6);

    await db.execute(
        'insert into urls (short_code, long_url) values (?, ?)',
        [shortCode, longUrl] 
    );
    res.json({
        message:'URL shortend successfully!',
        shortUrl: `http://localhost:3000/${shortCode}`
    });
} catch (err) {
    console.error('❌ Error creating short URL:', err);
    res.status(500).json({error: 'Internal server error'});
}
});

app.get('/:shortCode', async(req, res) => {
    try {
        const {shortCode} = req.params;
        const [rows] = await db.execute('select long_url from urls where short_code = ?', [shortCode]);
        if(rows.length>0) {
                res.redirect(rows[0].long_url);
        } else {
            res.status(404).json({error: 'Short url not found'});
        }
    } catch(err) {
        console.error('❌ Error fetching short URL:', err);
        res.status(500).json({error: 'Internal server error'});
    }
});

let db;

connectDB()
    .then((connection) => {
        db = connection;
        app.listen(3000, () => console.log("Server running at http://localhost:3000"))
    })
    .catch((err) => console.error("❌ MySQL connection failed", err));

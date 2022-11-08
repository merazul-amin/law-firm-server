const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.jnuj2ye.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const serviceCollection = client.db('assignment11').collection('services');

    app.get('/services', async (req, res) => {
        const limit = parseInt(req.query.limit);
        if (limit) {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(limit).toArray();
            return res.send(services);
        }
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    })
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
    res.send('Server is running');
})






app.listen(port, () => {
    console.log('server is running on port', port);
})
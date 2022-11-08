const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());



//mongodb client user

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.jnuj2ye.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    const serviceCollection = client.db('assignment11').collection('services');
    const reviewCollection = client.db('assignment11').collection('reviews');

    //This is for get all services and with limit

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

    //This is for get single service

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await serviceCollection.findOne(query);
        res.send(service);
    })

    //post reviews

    app.post('/setReview', async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result);
    })


    //get all reviews by service id

    app.get('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        const query = { serviceId: id };
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
    })


    //get user reviews

    app.get('/userReviews', async (req, res) => {
        const email = req.query.email;
        const query = { email: email }
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
    })


}
run().catch(err => console.log(err))


//primary test purpose
app.get('/', (req, res) => {
    res.send('Server is running');
})
//for listen
app.listen(port, () => {
    console.log('server is running on port', port);
})
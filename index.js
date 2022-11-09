const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


//function for check the validity of jwt token

function verify(req, res, next) {
    const token = req.headers.token;
    jwt.verify(token, process.env.jwt_code, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Unauthorized User' })
        }
        req.decoded = decoded;
        next()
    })
}



//mongodb client user

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_password}@cluster0.jnuj2ye.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    const serviceCollection = client.db('assignment11').collection('services');
    const reviewCollection = client.db('assignment11').collection('reviews');



    //Implement jwt token

    app.post('/jwt', async (req, res) => {
        const email = req.body;
        const token = jwt.sign(email, process.env.jwt_code, { expiresIn: '60h' });
        res.send({ token });
    })

    //This is for get all services and with limit

    app.get('/services', async (req, res) => {
        const limit = parseInt(req.query.limit);
        if (limit) {
            const query = {};
            const cursor = serviceCollection.find(query).sort({ time: -1 });
            const services = await cursor.limit(limit).toArray();
            return res.send(services);
        }
        const query = {};
        const cursor = serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    })

    // Post Services in db

    app.post('/services', async (req, res) => {
        const service = req.body;
        const result = await serviceCollection.insertOne(service);
        res.send(result);
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

    //get single review by id

    app.get('/editReview/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const review = await reviewCollection.findOne(query);
        res.send(review);
    })

    // update review by and id;

    app.put('/updateReview/:id', async (req, res) => {
        const id = req.params.id;

        const editedReview = req.body;
        const doc = {
            $set: {
                email: editedReview.email,
                name: editedReview.name,
                reviewText: editedReview.reviewText,
                serviceId: editedReview.serviceId,
                time: editedReview.time
            }
        }
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const result = await reviewCollection.updateOne(filter, doc, options);
        res.send(result);
    })


    //get all reviews by service id

    app.get('/reviews/:id', async (req, res) => {
        const id = req.params.id;
        const query = { serviceId: id };
        const cursor = reviewCollection.find(query).sort({ time: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews);
    })


    //get user reviews

    app.get('/userReviews', verify, async (req, res) => {
        const email = req.query.email;

        if (req.decoded.email !== email) {
            return res.status(403).send({ message: 'Unauthorized User' })
        }

        const query = { email: email }
        const cursor = reviewCollection.find(query).sort({ time: -1 });
        const reviews = await cursor.toArray();
        res.send(reviews);
    })

    app.delete('/userReviews/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);
        res.send(result);
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
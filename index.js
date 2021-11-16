const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zuy06.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('online_bike_store');
    const productsCollection = database.collection('products');
    const usersCollection = database.collection('users');
    const orderedBikes = database.collection("orderedBikes")


    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(user);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
        const user = req.body;
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
    });

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })


    app.get('/products',async(req,res)=>{
        console.log('hitting it hard');
        const cursor = productsCollection.find({});
        const products = await cursor.toArray();
        res.send(products);

    });
  
      // GET Single Service
      app.get('/products/:id', async (req, res) => {
        const id = req.params.id;
        console.log('getting specific product', id);
        const query = { _id: ObjectId(id) };
        const service = await productsCollection.findOne(query);
        res.json(service);
    });

     //post api
     app.post('/products',async(req,res)=>
     {
         const productInfo = req.body;
         console.log('hitting the post',productInfo);
         const result = await productsCollection.insertOne(productInfo);
         console.log(result);
         res.json(result);
     });

      //post api
      app.post('/orderedbikes',async(req,res)=>
      {
          const bikeInfo = req.body;
          console.log('hitting the ordered post',bikeInfo);
          const result = await orderedBikes.insertOne(bikeInfo);
          console.log(result);
          res.json(result);
      });


    // const database = client.db("insertDB");
    // const haiku = database.collection("haiku");
    // create a document to insert
    // const doc = {
    //   title: "Record of a Shriveled Datum",
    //   content: "No bytes, no problem. Just insert a document, in MongoDB",
    // }
    // const result = await haiku.insertOne(doc);

    // console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
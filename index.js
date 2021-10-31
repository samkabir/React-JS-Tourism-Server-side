const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.evn.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmw5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('database connected!');
        const database = client.db('tourism');
        const tourPlansCollection = database.collection('tourPlans');
        const toursBooked = database.collection('toursBooked');

        //GET API
        app.get('/tourPlans', async(req, res) =>{
          const cursor = tourPlansCollection.find({});
          const allTourPlans = await cursor.toArray();
          res.send(allTourPlans);
        });

        //GET API
        app.get('/toursBooked', async(req, res) =>{
          const cursor = toursBooked.find({});
          const tourBooked = await cursor.toArray();
          res.send(tourBooked);
        });

        //GET Single Plan
        app.get('/tourPlans/:id', async(req, res) =>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const plan = await tourPlansCollection.findOne(query);
          res.json(plan);
        });

        //POST API FOR BOOKING
        app.post('/toursBooked', async(req, res) =>{
          const tourBooked = req.body;
          const result = await toursBooked.insertOne(tourBooked);
          res.json(result);
        });

        // Use POST to get data by Email
        app.post('/toursBooked/byEmail', async (req, res) => {
          const emailOfPerson = req.body;
          console.log(emailOfPerson);
          // { $text: { $search: "\"coffee shop\"" } }
          const query = { email: { $in: emailOfPerson}}
          const products = await toursBooked.find(query).toArray();
          res.send(products);
      });

        //UPADATE API
        app.put('/toursBooked/:id', async(req, res)=> {
          const id = req.params.id;
          const filter = {_id: ObjectId(id) };
          const options = { upsert: true }; 
          const updateDoc = {
            $set: {
              status:'Approved'
            }
          }
          const result = await toursBooked.updateOne(filter, updateDoc, options);
          res.json(result);
        })


        //POST API
        app.post('/tourPlans', async(req, res) =>{
          const tourPlan = req.body;
          const result = await tourPlansCollection.insertOne(tourPlan);
          res.json(result);
        });

        //DELETE API
        app.delete('/toursBooked/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await toursBooked.deleteOne(query);
          res.json(result);
        })

    }
    finally{
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


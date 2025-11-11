const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('My utility bill server is running...')
})
// connecting the database
//  my-utility-hub    krNUZ4m2TK7ETwnT
const uri = "mongodb+srv://my-utility-hub:krNUZ4m2TK7ETwnT@cluster0.0dkhkz2.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // database collection:
    const db = client.db("utility-hub");
    const billsCollection = db.collection("bills");
    const myBillsCollection = db.collection("myBills")
    const paidBillCollection = db.collection("paidBills")


    app.get("/bills", async (req, res) => {
      try {
        const { category } = req.query;
        let query = {};

        if (category && category !== "All") {
          query.category = category;
        }

        const bills = await billsCollection.find(query).toArray();
        res.status(200).send(bills);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch bills", error });
      }
    });

    app.get("/latest-bills", async (req, res) => {
      const cursor = billsCollection.find().sort({ date: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/bills/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const result = await billsCollection.findOne({ _id: objectId });
      res.send(result);

    });

    app.post('/bills', async (req, res) => {
            const newBill = req.body;
            const result = await billsCollection.insertOne(newBill);
            res.send(result);
        })

    // saving bill data after paying bill
    app.post('/paidBills', async (req, res) => {
            const paidBill = req.body;
            const result = await paidBillCollection.insertOne(paidBill);
            res.send(result);
        })

    // myBills related all api

    app.get("/myBills", async (req, res) => {
      const result = await myBillsCollection.find().toArray();
      res.send(result);
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`My Utility Hub server is running on port : ${port}`)
})

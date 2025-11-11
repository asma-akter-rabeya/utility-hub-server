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



    // myBills related all api

    // saving bill data after paying bill
    app.post('/myBills', async (req, res) => {
      const paidBill = req.body;
      const result = await myBillsCollection.insertOne(paidBill);
      res.send(result);
    })

    // app.get("/myBills", async (req, res) => {
    //   const result = await myBillsCollection.find().toArray();
    //   res.send(result);
    // });

    app.get("/myBills", async (req, res) => {
      try {
        const { email } = req.query;
        let query = {};
        if (email) query.email = email;
        const result = await myBillsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch user bills", error });
      }
    });


    // Update a specific paid bill by ID
    app.put('/myBills/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedBill = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            amount: updatedBill.amount,
            address: updatedBill.address,
            phone: updatedBill.phone,
            date: updatedBill.date,
          },
        };

        const result = await myBillsCollection.updateOne(filter, updateDoc);
        if (result.modifiedCount === 0) {
          return res.status(404).send({ message: "No bill found to update." });
        }

        res.send({ message: "Bill updated successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Failed to update bill", error });
      }
    });


    // Delete a specific paid bill by ID
    app.delete('/myBills/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await myBillsCollection.deleteOne(filter);

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "No bill found to delete." });
        }

        res.send({ message: "Bill deleted successfully", result });
      } catch (error) {
        res.status(500).send({ message: "Failed to delete bill", error });
      }
    });


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`My Utility Hub server is running on port : ${port}`)
})

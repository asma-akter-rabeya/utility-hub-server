const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

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


  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`My utility bill server is running on port : ${port}`)
})

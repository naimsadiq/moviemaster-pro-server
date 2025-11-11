//VkL5uf4k4falCnFh    moviesDB

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://moviesDB:VkL5uf4k4falCnFh@cluster0.e1tbnr7.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("movies-db");
    const moviesCollection = db.collection("movies");

    //all movies data
    app.get("/movies", async (req, res) => {
      const result = await moviesCollection.find().toArray();
      res.send(result);
    });

    //id movie data
    app.get("/movie-details/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await moviesCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    //movie insert data
    app.post("/movies", async (req, res) => {
      const data = req.body;
      // console.log(data)
      const result = await moviesCollection.insertOne(data);
      console.log(result);
      res.send({
        success: true,
        result,
      });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

//VkL5uf4k4falCnFh    moviesDB

const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const serviceAccount = require("./moviemaster-pro-firebase-admin.json");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// firebase admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
    const watchlistCollection = db.collection("watchlist");

    //middleware
    const verifyUser = async (req, res, next) => {
      const authorization = req.headers.authorization;

      if (!authorization) {
        return res.status(401).send({
          message: "unauthorized access. Token not found!",
        });
      }

      const token = authorization.split(" ")[1];
      try {
        await admin.auth().verifyIdToken(token);

        next();
      } catch (error) {
        res.status(401).send({
          message: "unauthorized access.",
        });
      }
    };

    //all movies data
    app.get("/movies", async (req, res) => {
      const result = await moviesCollection.find().toArray();
      res.send(result);
    });

    //id movie data
    app.get("/movie-details/:id", verifyUser, async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await moviesCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    //update movie details
    app.get("/movies/:id", async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await moviesCollection.findOne({ _id: objectId });

      res.send(result);
    });

    app.put("/movies/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      // console.log(id);
      // console.log(data);
      const objectId = new ObjectId(id);
      const filter = { _id: objectId };
      const update = {
        $set: data,
      };

      const result = await moviesCollection.updateOne(filter, update);

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

    //my collection movies
    app.get("/my-collection", verifyUser, async (req, res) => {
      const email = req.query.email;
      const result = await moviesCollection
        .find({ created_by: email })
        .toArray();
      res.send(result);
    });

    //delete movie
    app.delete("/movie/:id", async (req, res) => {
      const { id } = req.params;
      const result = await moviesCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send({
        success: true,
        result,
      });
    });
    // watch list movie data
    app.post("/watchlist/:id", async (req, res) => {
      const data = req.body;

      const result = await watchlistCollection.insertOne(data);
      console.log(result);
      res.send({
        success: true,
        result,
      });
    });

    app.get("/my-watchlist", verifyUser, async (req, res) => {
      const email = req.query.email;
      const result = await watchlistCollection
        .find({ watchlist_by: email })
        .toArray();
      res.send(result);
    });

    // delete watchlist
    app.delete("/my-watchlist/:id", async (req, res) => {
      const { id } = req.params;
      const result = await watchlistCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send({
        success: true,
        result,
      });
    });

    //searcing movies
    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const result = await moviesCollection
        .find({ title: { $regex: search_text, $options: "i" } })
        .toArray();
      res.send(result);
    });

    //genre data api
    app.get("/movies", async (req, res) => {
      const genre = req.query.genre;

      if (genre) {
        const result = await moviesCollection
          .find({ genres: { $regex: genre, $options: "i" } })
          .toArray();
        return res.send(result);
      }

      const allMovies = await moviesCollection.find().toArray();
      res.send(allMovies);
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

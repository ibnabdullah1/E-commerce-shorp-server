const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.rjnekog.mongodb.net/VegetablesShopBD?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Database collection
    const usersCollection = client.db("VegetablesShopBD").collection("users");
    const shoppingCartCollection = client
      .db("VegetablesShopBD")
      .collection("shoppingCart");
    const featuredProductsCollection = client
      .db("VegetablesShopBD")
      .collection("featuredProducts");
    const productsCollection = client
      .db("VegetablesShopBD")
      .collection("products");
    // Save user in database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const update = { $set: user };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      if (isExist) return res.send({ message: "User already exist" });
      const result = await usersCollection.updateOne(query, update, options);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });
    app.get("/featured-products", async (req, res) => {
      const result = await featuredProductsCollection.find().toArray();
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      const result = await productsCollection
        .aggregate([
          {
            $group: {
              _id: "$category",
              quantity: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              category: "$_id",
              quantity: "$quantity",
            },
          },
        ])
        .toArray();

      res.send(result);
    });

    app.post("/shopping-cart", async (req, res) => {
      const products = req.body;
      console.log(products);
      // const result = await shoppingCartCollection.insertOne(products);
      // res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Eco Bazar shop server is running");
});

app.listen(port, () => {
  console.log(`Eco Bazar shop is running on port ${port}`);
});

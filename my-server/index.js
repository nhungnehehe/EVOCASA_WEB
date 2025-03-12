
app.get("/orders", async (req, res) => {
  try {
    const result = await orderCollection.find({}).toArray();
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ error: "Error fetching products" });
  }
});
app.get("/orders/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
});
app.post("/orders", cors(), async (req, res) => {
  //put json Order into database 
  await orderCollection.insertOne(req.body)
  //send message to client(send all database to client) 
  res.send(req.body)
})
app.delete("/orders/:id", cors(), async (req, res) => {
  //find detail Order with id 
  var o_id = new ObjectId(req.params["id"]);
  const result = await orderCollection.find({ _id: o_id }).toArray();
  //update json Order into database 
  await orderCollection.deleteOne(
    { _id: o_id }
  )
  res.send(result[0])
}) 

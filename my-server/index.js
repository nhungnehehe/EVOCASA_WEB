const express = require('express');
const app = express();
const port = 3002;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

// Middleware setup
app.use(morgan("combined"));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: 'http://localhost:4200', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Support cookies in browser
}));
app.use(cookieParser());
app.use(session({
    secret: "Shh, its a secret!",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 45 * 60 * 1000 } // Session timeout: 45 minutes
}));
app.use(fileUpload());

// Static file serving
app.use(
    "/images",
    cors(),
    express.static(path.join(__dirname, "public", "images"))
);

// Tạo thư mục upload nếu chưa tồn tại
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// MongoDB connection
const client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
const database = client.db("EvoCasa");
const productCollection = database.collection("Product");
const categoryCollection = database.collection("Category");

// Helper functions to clean HTML and decode HTML entities
const decodeHtmlEntities = (text) => {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
};

const stripHtml = (html) => {
    if (!html) return "";
    const textWithoutHtml = html.replace(/<[^>]*>?/gm, ""); // Remove HTML tags
    return decodeHtmlEntities(textWithoutHtml); // Decode HTML entities
};

// Middleware to initialize cart in session
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = []; // Initialize cart if not already set
    }
    next();
});

// Server startup
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to the EvoCasa API!");
});

// ===== PRODUCT APIS =====

// API to get all products
app.get("/products", async (req, res) => {
    try {
        const result = await productCollection.find({}).toArray();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send({ error: "Error fetching products" });
    }
});

// API to get products by category
app.get("/products/category/:categoryId", async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await productCollection.find({ category_id: categoryId }).toArray();
        res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).send({ error: "Error fetching products by category" });
    }
});

// API to get a specific product
app.get("/products/:identifier", async (req, res) => {
    try {
        const { identifier } = req.params;
        
        let query;
        if (ObjectId.isValid(identifier)) {
            // Nếu identifier là một ObjectId hợp lệ, tìm theo ID
            query = { _id: new ObjectId(identifier) };
        } else {
            // Nếu không phải ObjectId, tìm theo tên sản phẩm
            query = { Name: decodeURIComponent(identifier) };
        }

        const result = await productCollection.findOne(query);
        if (!result) {
            return res.status(404).send({ error: "Product not found" });
        }

        res.status(200).send(result);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ error: "Error fetching product" });
    }
});



// API to create a new product
app.post("/products", async (req, res) => {
    try {
        const {
            category_id,
            Name,
            Price,
            Image,
            Description,
            Origin,
            Uses,
            Store,
            Quantity,
            Dimension,
            Story,
            ProductCare,
            ShippingReturn
        } = req.body;

        const newProduct = {
            category_id,
            Name,
            Price: parseInt(Price),
            Image: Array.isArray(Image) ? Image : [Image],
            Description: stripHtml(Description),
            Origin,
            Uses,
            Store,
            Quantity: parseInt(Quantity),
            Create_date: new Date(),
            Dimension,
            Story: stripHtml(Story),
            ProductCare: stripHtml(ProductCare),
            ShippingReturn: stripHtml(ShippingReturn)
        };

        const result = await productCollection.insertOne(newProduct);
        res.status(201).send({
            _id: result.insertedId,
            ...newProduct
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send({ error: "Error creating product" });
    }
});

// API to update a product
app.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            category_id,
            Name,
            Price,
            Image,
            Description,
            Origin,
            Uses,
            Store,
            Quantity,
            Dimension,
            Story,
            ProductCare,
            ShippingReturn
        } = req.body;

        const updatedProduct = {
            category_id,
            Name,
            Price: parseInt(Price),
            Image: Array.isArray(Image) ? Image : [Image],
            Description: stripHtml(Description),
            Origin,
            Uses,
            Store,
            Quantity: parseInt(Quantity),
            Dimension,
            Story: stripHtml(Story),
            ProductCare: stripHtml(ProductCare),
            ShippingReturn: stripHtml(ShippingReturn)
        };

        const result = await productCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedProduct }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: "Product not found" });
        }

        res.status(200).send({
            _id: id,
            ...updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ error: "Error updating product" });
    }
});

// API to delete a product
app.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).send({ error: "Product not found" });
        }
        
        res.status(200).send({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ error: "Error deleting product" });
    }
});

// ===== CART APIS =====

// API to add a product to the cart
app.post("/cart", async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await productCollection.findOne({ _id: new ObjectId(productId) });
        if (!product) {
            return res.status(404).send({ error: "Product not found" });
        }

        // Check if the product already exists in the cart
        const existingProduct = req.session.cart.find(item => item.productId === productId);
        if (existingProduct) {
            existingProduct.cartQuantity += quantity; // Update quantity
        } else {
            req.session.cart.push({
                productId,
                _id: product._id,
                category_id: product.category_id,
                Name: product.Name,
                Price: product.Price,
                Image: product.Image,
                Description: product.Description,
                Origin: product.Origin,
                Uses: product.Uses,
                Store: product.Store,
                Quantity: product.Quantity,
                cartQuantity: quantity,
                Create_date: product.Create_date,
                Dimension: product.Dimension,
                Story: product.Story,
                ProductCare: product.ProductCare,
                ShippingReturn: product.ShippingReturn
            });
        }

        console.log("Cart updated:", req.session.cart);
        res.status(200).send(req.session.cart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(400).send({ error: "Invalid product ID or request" });
    }
});

// API to get all products in the cart
app.get("/cart", (req, res) => {
    console.log("Fetching cart:", req.session.cart);
    res.status(200).send(req.session.cart);
});

// API to update product quantity in the cart
app.put("/cart", (req, res) => {
    const { productId, quantity } = req.body;

    const product = req.session.cart.find(item => item.productId === productId);
    if (!product) {
        return res.status(404).send({ error: "Product not found in cart" });
    }

    // Update the quantity
    product.cartQuantity = quantity;
    console.log("Cart updated:", req.session.cart);
    res.status(200).send(req.session.cart);
});

// API to delete a product from the cart
app.delete("/cart/:productId", (req, res) => {
    const { productId } = req.params;

    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
    console.log("Cart after deletion:", req.session.cart);
    res.status(200).send(req.session.cart);
});

// API to clear the entire cart
app.delete("/cart", (req, res) => {
    req.session.cart = [];
    console.log("Cart cleared");
    res.status(200).send(req.session.cart);
});

// ===== IMAGE UPLOAD APIS =====

// Get image
app.get("/image/:id", cors(), (req, res) => {
    const id = req.params["id"];
    res.sendFile(path.join(uploadDir, id));
});

// Upload image
app.post("/upload", (req, res) => {
    const { image } = req.files;
    if (!image) return res.status(400).send({ error: "No image file provided" });
    
    image.mv(path.join(uploadDir, image.name));
    res.status(200).send({ 
        message: "Image uploaded successfully",
        filename: image.name
    });
});

// ===== CATEGORY APIS =====
// Lấy thông tin Category
app.get("/categories", cors(), async (req, res) => {
    const result = await categoryCollection.find({}).toArray();
    res.send(result);
  })
  
  app.get("/categories/:id", cors(), async (req, res) => {
    var o_id = new ObjectId(req.params["id"]);
    const result = await categoryCollection.find({ _id: o_id }).toArray();
    res.send(result[0]);
  });
  
  // Get categories by name
  app.get("/categories/category/:name", cors(), async (req, res) => {
    try {
      const result = await categoryCollection.find({ Name: { $regex: new RegExp(req.params["name"], "i") } }).toArray();
      res.send(result);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });
  
  app.put("/categories", cors(), async (req, res) => {
    //update json products into database
    await categoryCollection.updateOne(
      { _id: new ObjectId(req.body._id) }, //condition for update
      {
        $set: {
          //Field for updating  
          Name: req.body.Name,
          Description: req.body.Description,
        },
      }
    );
    //send Category after updating
    var o_id = new ObjectId(req.body._id);
    const result = await categoryCollection.find({ _id: o_id }).toArray();
    res.send(result[0]);
  });
  
  app.post("/categories", cors(), async (req, res) => {
    //put json into database
    await categoryCollection.insertOne(req.body);
    //send message to client(send all database to client)
    res.send(req.body);
  });
  
  app.delete("/categories/:id", cors(), async (req, res) => {
    //find detail Category with id
    var o_id = new ObjectId(req.params["id"]);
    const result = await categoryCollection.find({ _id: o_id }).toArray();
    //update json Category into database
    await categoryCollection.deleteOne({ _id: o_id });
    //send Category after remove
    res.send(result[0]);
  });
0  
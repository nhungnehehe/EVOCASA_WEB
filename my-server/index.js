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
const customerCollection = database.collection("Customer");
const orderCollection = database.collection("Order");
const accountCollection = database.collection("Account");

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
  
// Get category by either ID or name
// Get category by ID
app.get("/categories/:id", cors(), async (req, res) => {
  var o_id = new ObjectId(req.params["id"]);
  const result = await categoryCollection.find({ _id: o_id }).toArray();
  res.send(result[0]);
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
  //---------------------CUSTOMER----------------------------//
  // Route thay thế cho /customer (trỏ về cùng một endpoint)
  app.get("/customers", async (req, res) => {
    try {
      const result = await customerCollection.find({}).toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Lấy khách hàng theo ID
  app.get("/customer/:id", async (req, res) => {
    try {
      const id = req.params["id"];
      const o_id = new ObjectId(id);
      const result = await customerCollection.find({ _id: o_id }).toArray();
      
      if (result.length === 0) {
        return res.status(404).send({ message: "Customer not found." });
      }
      
      res.send(result[0]);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
// Lấy khách hàng theo số điện thoại
app.get("/customers/phone/:phonenumber", cors(), async (req, res) => {
  try {
    const phone = req.params["phonenumber"];
    
    // Tìm khách hàng theo số điện thoại
    const customer = await customerCollection.findOne({ Phone: phone });
    
    // Kiểm tra nếu không tìm thấy khách hàng
    if (!customer) {
      return res.status(404).send({ 
        success: false, 
        message: "Không tìm thấy khách hàng với số điện thoại này." 
      });
    }
    
    // Trả về toàn bộ thông tin khách hàng, bao gồm cả thông tin nhạy cảm
    res.status(200).send({
      success: true,
      data: customer
    });
    
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    res.status(500).send({ 
      success: false, 
      message: "Đã xảy ra lỗi khi tìm kiếm khách hàng.",
      error: error.message
    });
  }
});
  
  // Thêm khách hàng mới
  app.post("/customers", async (req, res) => {
    try {
      const newCustomer = req.body;
      // Thêm ngày tạo nếu chưa có
      if (!newCustomer.CreatedAt) {
        newCustomer.CreatedAt = new Date();
      }
      // Khởi tạo giỏ hàng trống nếu chưa có
      if (!newCustomer.Cart) {
        newCustomer.Cart = [];
      }
      
      const result = await customerCollection.insertOne(newCustomer);
      res.status(201).send({
        ...newCustomer,
        _id: result.insertedId
      });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Cập nhật thông tin khách hàng (version 1 - đầy đủ thông tin)
  app.put("/customers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const o_id = new ObjectId(id);
      const updates = {
        Name: req.body.Name,
        Phone: req.body.Phone,
        Mail: req.body.Mail,
        DOB: req.body.DOB,
        Address: req.body.Address,
        Gender: req.body.Gender,
        Image: req.body.Image
      };
      
      // Loại bỏ các trường undefined
      Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });
      
      await customerCollection.updateOne(
        { _id: o_id },
        { $set: updates }
      );
      
      const updatedCustomer = await customerCollection.findOne({ _id: o_id });
      if (!updatedCustomer) {
        return res.status(404).send({ message: "Customer not found." });
      }
      
      res.send(updatedCustomer);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Cập nhật giỏ hàng khách hàng
  app.put("/customers/:id/cart", async (req, res) => {
    try {
      const id = req.params.id;
      const o_id = new ObjectId(id);
      const updatedCart = req.body.Cart || [];
      
      await customerCollection.updateOne(
        { _id: o_id },
        { $set: { Cart: updatedCart } }
      );
      
      const updatedCustomer = await customerCollection.findOne({ _id: o_id });
      if (!updatedCustomer) {
        return res.status(404).send({ message: "Customer not found." });
      }
      
      res.send(updatedCustomer);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Xóa khách hàng
  app.delete("/customers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const o_id = new ObjectId(id);
      
      const result = await customerCollection.deleteOne({ _id: o_id });
      
      if (result.deletedCount === 0) {
        return res.status(404).send({ message: "Customer not found." });
      }
      
      res.send({ message: "Customer deleted successfully." });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  // Đăng ký
app.post("/register", cors(), async (req, res) => {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const userData = req.body;
  const hash = crypto.pbkdf2Sync(userData.Password, salt, 1000, 64, `sha512`).toString(`hex`);
  
  // Tạo đối tượng khách hàng mới với password đã mã hóa
  const newCustomer = {
    Name: userData.Name,
    Phone: userData.Phone,
    Mail: userData.Mail,
    DOB: userData.DOB || '',
    Address: userData.Address || '',
    Password: hash,
    PasswordSalt: salt, // Thêm field salt để lưu
    Gender: userData.Gender || '',
    Image: userData.Image || '',
    CreatedAt: new Date(),
    Cart: []
  };
  
  await customerCollection.insertOne(newCustomer);
  res.status(201).send({
    message: "Successfully registered.",
    user: { ...newCustomer, Password: undefined, PasswordSalt: undefined }
  });
});

// Đăng nhập
app.post('/login', cors(), async (req, res) => {
  const { phonenumber, password } = req.body;
  const crypto = require('crypto');
  
  const user = await customerCollection.findOne({ Phone: phonenumber });
  if (!user) {
    return res.status(401).send({ message: 'The phone number does not exist.' });
  }
  
  // Kiểm tra nếu có PasswordSalt (nếu đã migrate sang hệ thống mới)
  if (user.PasswordSalt) {
    const hash = crypto.pbkdf2Sync(password, user.PasswordSalt, 1000, 64, `sha512`).toString(`hex`);
    if (user.Password === hash) {
      // Không trả về password và salt
      const { Password, PasswordSalt, ...userInfo } = user;
      return res.send(userInfo);
    }
  } else if (user.Password === password) {
    // Xử lý tạm thời cho trường hợp chưa migrate (password chưa mã hóa)
    // Bạn nên migrate dữ liệu sang dạng mã hóa
    const { Password, ...userInfo } = user;
    return res.send(userInfo);
  }
  
  res.status(401).send({ message: 'The password is incorrect' });
});

// Đổi mật khẩu
app.put('/change-password', cors(), async (req, res) => {
  const { phonenumber, oldPassword, newPassword } = req.body;
  const crypto = require('crypto');
  
  const user = await customerCollection.findOne({ Phone: phonenumber });
  if (!user) {
    return res.status(401).send({ message: 'The phone number does not exist.' });
  }
  
  // Kiểm tra mật khẩu cũ
  let isOldPasswordValid = false;
  if (user.PasswordSalt) {
    const oldHash = crypto.pbkdf2Sync(oldPassword, user.PasswordSalt, 1000, 64, `sha512`).toString(`hex`);
    isOldPasswordValid = (user.Password === oldHash);
  } else {
    isOldPasswordValid = (user.Password === oldPassword);
  }
  
  if (!isOldPasswordValid) {
    return res.status(401).send({ message: 'The old password is incorrect' });
  }
  
  // Tạo salt và hash mới cho mật khẩu mới
  const newSalt = crypto.randomBytes(16).toString(`hex`);
  const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 1000, 64, `sha512`).toString(`hex`);
  
  await customerCollection.updateOne(
    { Phone: phonenumber }, 
    { $set: { Password: newHash, PasswordSalt: newSalt } }
  );
  
  res.send({ message: 'Password changed successfully.' });
});
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

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const stripe = require('stripe')('your-stripe-secret-key');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/brandingstore', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Schemas
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String,
});
const OrderSchema = new mongoose.Schema({
    userId: String,
    products: Array,
    total: Number,
    date: { type: Date, default: Date.now },
});

// Define Models
const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send('User registered');
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

app.post('/api/products', async (req, res) => {
    const { name, price, description, image } = req.body;
    const newProduct = new Product({ name, price, description, image });
    await newProduct.save();
    res.status(201).json(newProduct);
});

app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/api/checkout', async (req, res) => {
    const { token, products } = req.body;
    const total = products.reduce((sum, product) => sum + product.price, 0);

    try {
        const charge = await stripe.charges.create({
            amount: total * 100,
            currency: 'usd',
            description: 'Branding Store Purchase',
            source: token,
        });

        const newOrder = new Order({
            userId: req.session.userId,
            products,
            total,
        });
        await newOrder.save();
        res.status(201).send('Payment successful');
    } catch (error) {
        res.status(500).send('Payment failed');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

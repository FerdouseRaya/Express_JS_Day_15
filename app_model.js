const dotenv = require('dotenv').config();
const cors =require('cors');
const {success,failure} = require('./util/common');

//Exporting all the routes
const UserRouter = require("./routes/User");
const ProductRouter = require("./routes/Product");
const TransactionRouter = require("./routes/Transaction");
const AuthRouter = require('./routes/Auth');

//Database Connection Export
const databaseConnection = require("./config/database");



//Express Modules
const express = require ('express');
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded




//main routers
app.use("/products", ProductRouter);
app.use("/transactions", TransactionRouter);
app.use("/users", UserRouter);
app.use('/auth',AuthRouter);


//Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Invalid JSON format' });
  }
  next();
});

app.use('*', (req, res) => {
  return res.status(400).send('Wrong URL!');
});

databaseConnection(()=>{
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
})
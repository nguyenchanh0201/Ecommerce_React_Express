const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();


app.use("/products", (req, res) => {
    proxy.web(req, res, { target: "http://localhost:3001" });
});

// Route requests to the order service
app.use("/orders", (req, res) => {
    proxy.web(req, res, { target: "http://localhost:3002" });
});
// Route requests to the auth service
app.use("/", (req, res) => {
    proxy.web(req, res, { target: "http://localhost:3000" });
});

// Route requests to the product service


// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});
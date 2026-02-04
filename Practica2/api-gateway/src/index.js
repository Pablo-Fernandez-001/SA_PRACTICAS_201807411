require("dotenv").config();
const express = require("express");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const app = express();
app.use(express.json());

const packageDef = protoLoader.loadSync("../proto/auth.proto");
const proto = grpc.loadPackageDefinition(packageDef).auth;

const client = new proto.AuthService(
  "auth-service:50051",
  grpc.credentials.createInsecure()
);

app.post("/register", (req, res) => {
  client.Register(req.body, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response);
  });
});

app.post("/login", (req, res) => {
  client.Login(req.body, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response);
  });
});

app.listen(3000, () => console.log("Gateway en puerto 3000"));

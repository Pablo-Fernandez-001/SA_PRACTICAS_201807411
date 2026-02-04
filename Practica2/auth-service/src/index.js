require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const packageDef = protoLoader.loadSync("../proto/auth.proto");
const proto = grpc.loadPackageDefinition(packageDef).auth;

const db = mysql.createPool({
  host: "db",
  user: "root",
  password: "root",
  database: "auth_db"
});

const server = new grpc.Server();

server.addService(proto.AuthService.service, {
  Register: async (call, callback) => {
    const { email, password, role } = call.request;
    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hash, role]
    );

    callback(null, { success: true, message: "Usuario registrado" });
  },

  Login: async (call, callback) => {
    const { email, password } = call.request;
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return callback(null, { success: false, message: "Usuario no existe" });
    }

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) {
      return callback(null, { success: false, message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: rows[0].id, role: rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    callback(null, { success: true, token });
  }
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
);

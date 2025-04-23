const express = require('express')
const http = require('http')
const dotenv = require('dotenv')
const cors = require('cors')
const { Server } = require('socket.io')
const { handleSocket } = require('./socket')
const authRoutes = require("./routes/router");
const cookieParser = require('cookie-parser');
const connectToMongoDB = require('./config/database')
const { handleSocketCustom } = require('./customSocket')
dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

const WELCOME_MESSAGE = "Welcome To Blueace India. How can I help you today?";

connectToMongoDB()
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

const sendChunks = async (socket, message) => {
    const words = message.split(" ");
    for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? " " : "");
        socket.emit("ai_reply", { chunk });
        await new Promise((res) => setTimeout(res, 100));
    }
};


app.get('/', (req, res) => {
    res.send("Hey i a booking ai agent")
})


app.use("/api/auth", authRoutes);


io.on("connection", (socket) => {
    const metaCode = socket.handshake.query.metaCode;
    const type = socket.handshake.query.type;
    console.log("User connected:", socket.id);
    console.log("User metaCode:", metaCode);

    if (type === "custom") {
        handleSocketCustom(socket, metaCode);
    } else {

        handleSocket(socket, metaCode);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on Port Number ${PORT}`);
});
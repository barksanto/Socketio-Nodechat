const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// set static folder- now if we visit localhost:3000 this is what opens
app.use(express.static(path.join(__dirname, "publicbasic")));

const botName = "ChatCord Bot";
// Run when a client connects
io.on("connect", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		// Welcome user
		// we can call the first argument here anything, it's just a keyword/event the client side will listen to
		socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

		//  .broadcast notifies everyone there's a new connection,
		// except the user that's connecting - emit to specific room
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(botName, `${username} has joined the chat`)
			);
	});

	// Listen for chat message
	socket.on("chatMessage", (msg) => {
		// we captured the input on client
		// receiving here in the server
		// pushing it to other clients now
		io.emit("message", formatMessage("USER", msg));
	});

	// run when client disconnects
	socket.on("disconnect", () => {
		socket.emit("message", formatMessage(botName, "A user has left the chat!"));
	});
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

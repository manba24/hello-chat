var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.use(express.static(path.join(__dirname, 'public')));
server.listen(3000, (err) => {
	if(err) {
		throw err;
	}
	console.log('server is start at:%d', 3000);
})
var users = [];
io.on('connection', function(socket) {
	//接收并处理客户端发送的login事件
	socket.on('login', function(nickname) {
		if(users.indexOf(nickname) > -1) {
			socket.emit('nickExisted');
		} else {
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
		};
	});
	socket.on('disconnect', function() {
		//将断开连接的用户从users中删除
		users.splice(socket.userIndex, 1);
		//通知除自己以外的所有人
		socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
	});
	socket.on('postMsg', function(msg,color) {
		//将消息发送到除自己外的所有用户
		socket.broadcast.emit('newMsg', socket.nickname, msg,color);
	});
	socket.on('img', function(imgData) {
		socket.broadcast.emit('newImg', socket.nickname, imgData)
	})
});
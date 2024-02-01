import WebSocket, { WebSocketServer } from 'ws';
// import WebSocket from 'ws'


let wss = false

function getInstance(){

	if( wss ) return wss

	wss = new WebSocketServer({
		// port: env.PORT,// + 1,
		noServer: true, // ^^ mutex
		clientTracking: true,
	})

	// wss.user_data = { // use this instead of passing WebSocket everywhere Server is required
	// 	OPEN: WebSocket.OPEN
	// }

	return wss

}

export default  getInstance


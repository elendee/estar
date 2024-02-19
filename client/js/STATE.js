const states = []

const state = {
	animating: false,
	get: () => {
		return states[ states.length - 1 ]
	},
	// pop: () => {
	// 	return states.pop()
	// },
	// set: () => {

	// },
	// clear: () => {
	// 	states.length = 0
	// }
}

export default state
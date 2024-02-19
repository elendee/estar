
const toggle = document.getElementById('toggle')

toggle.addEventListener('click', () => {
	toggle.parentElement.classList.toggle('toggled')
})

export default {}
// async function autocomplete(){
// 	console.log("HERE");
// 	const input = document.getElementById("candySearch").value;
// 	const response = await fetch(`/autocomplete/${input}`);
// 	const json = await response.json();
// 	let html = document.getElementById("results");
// 	html.innerHTML = "<ul id='resultsList'>";
// 	for(let i=0; i<json.length; ++i){
// 		console.log(json[i]);
// 		html.innerHTML += '<li>'+json[i].competitorname+'</li>';
// 	}
// 	html.innerHtml += "</ul>";
// }

// document.getElementById("candySearch").oninput = autocomplete;

function getUserObj() {
	let uname = document.getElementById('username').value
	let pass = document.getElementById('password').value
	if (!uname || !pass) {
		alert('username and password are required')
	}
	let user = {
		'username': uname,
		'password' : pass
	}
	return user
}

// Main Page //

const longitude = document.getElementById("longitude")
const latitude = document.getElementById("latitude")

const locate = document.getElementById("locate")
if (locate) {
	locate.onclick = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
			  function(position) {
				const lat = position.coords.latitude;
				const long = position.coords.longitude;
				latitude.value = lat
				longitude.value = long
			  },
			  function(error) {
				console.error("Error getting geolocation:", error.message);
			  }
			);
		  } else {
			alert("Geolocation is available.");
		  }
	}
}

const clear = document.getElementById("clear")
if (clear) {
	clear.onclick = () => {
		longitude.value = ''
		latitude.value = ''
	}
}

const recommend = document.getElementById("recommend")
if (recommend) {
	recommend.onclick = () => {
		const long = longitude.value
		const lat = latitude.value
		if (long == '' || lat == '') {
			alert('Longitude and Latitude are required')
			return
		} else {
			fetch(`/recommend/${lat}/${long}`)
			.then(response => response.json())
			.then(data => {
				let html = formatWeatherSongData(data)
				document.getElementById("resultData").innerHTML = html
			})
			.catch(error => {
				alert(error);
			});
		}
	}
}

function formatWeatherSongData(data) {
	let { weather, song } = data
	console.log(data)
	return `
	<div class="weatherData">
		<img src="${weather.icon}" alt="${weather.shortForecast}" height="100px">
		<div class="dataDiv">
			<span>Weather - ${weather.name}</span>
			<span>${weather.city} ${weather.state}</span>
			<span>${weather.detailedForecast}</span>
			<span>Gloom Index: ${weather.gloom.value} (${weather.gloom.desc})</span>
		</div>
	</div>
	<div class="songData">
		<img src="${song.album_img}" alt="${song.album_name}" height="100px"/>
		<div class="dataDiv">
			<span>Song: ${song.track_name}</span>
			<span>Album: ${song.album_name}</span>
			<span>Gloom Index: ${song.gloom_index}</span>
		</div>
	</div>`
}



// Login Page //

async function submitLogin() {
	let user = getUserObj()
	fetch('/auth/local', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
  		body: JSON.stringify(user)
	}).then(response => {
		if (response.status == 200) {
			window.location = '/'
		} else {
			alert(`Error logging in`)
		}
	})
	.catch(error => {
		alert(error);
	});
}

const loginBtn = document.getElementById("submitLogin")
if (loginBtn) {
	loginBtn.onclick = submitLogin
}

// Register Page //

async function submitRegister() {
	let user = getUserObj()
	fetch('/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
  		body: JSON.stringify(user)
	}).then(response => {
		if (response.status == 200) {
			alert('User Saved')
			window.location = '/'
		} else {
			alert(`Error saving user`)
		}
	})
	.catch(error => {
		alert(error);
	});
}
  
const registerBtn = document.getElementById("submitRegister")
if (registerBtn) {
	registerBtn.onclick = submitRegister
}

// Manage Users //

// edit user
async function editUser(e) {
	const id = e.target.dataset.id
	document.getElementById(`newName_${id}`).classList.remove('hide')
	document.getElementById(`newPass_${id}`).classList.remove('hide')
	document.getElementById(`saveEditBtn_${id}`).classList.remove('hide')
	e.target.classList.add('hide')
}
var editBtns = document.getElementsByClassName("editBtn");
for (var i = 0; i < editBtns.length; i++) {
    editBtns[i].addEventListener('click', editUser, false);
}

// save
async function saveEditUser(e) {
	const id = e.target.dataset.id
	let newName = document.getElementById(`newName_${id}`).value
	let newPass = document.getElementById(`newPass_${id}`).value
	if (newName.trim() == '' || newPass.trim() == '') {
		alert('Username and password required')
		return
	}
	fetch(`/users/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
  		body: JSON.stringify({ username: newName, password: newPass })
	}).then(response => {
		if (response.status == 200) {
			alert('User Updated')
			location.reload()
		} else {
			alert(`Error deleting user`)
		}
	})
	.catch(error => {
		alert(error);
	});
}
var editSaveBtns = document.getElementsByClassName("saveEditBtn");
for (var i = 0; i < editSaveBtns.length; i++) {
    editSaveBtns[i].addEventListener('click', saveEditUser, false);
}


// delete user
async function deleteUser(e) {
	const id = e.target.dataset.id
	console.log(id)
	if (confirm("Are you sure you want to delete this user?")) {
		fetch(`/users/${id}`, {
			method: 'DELETE'
		}).then(response => {
			if (response.status == 200) {
				alert('User Deleted')
				location.reload()
			} else {
				alert(`Error deleting user`)
			}
		})
		.catch(error => {
			alert(error);
		});
	}
}
var deleteBtns = document.getElementsByClassName("deleteBtn");
for (var i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener('click', deleteUser, false);
}
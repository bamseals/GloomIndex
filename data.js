const express = require('express')
const mongoose = require('mongoose')
const { Schema } = mongoose

const { checkAuth } = require('./auth.js')

dataRoutes = express.Router()

const songSchema = new Schema({
    track_name: {
        type: String,
        required: true
    },
    valence: {
        type: Number,
    },
    duration: {
        type: Number,
    },
    lyrics: {
        type: String,
    },
    album_name: {
        type: String,
    },
    album_release_year: {
        type: Number,
    },
    album_img: {
        type: String,
    },
    pct_sad: {
        type: Number,
    },
    word_count: {
        type: Number,
    },
    lyrical_density: {
        type: Number,
    },
    gloom_index: {
        type: Number,
        required: true
    },
});

const Song = mongoose.model('Song', songSchema)

// get all users
userRoutes.get('/songs', 
    checkAuth,
    async function(req, res) {
        const songs = await Song.find({}).sort({gloom_index: -1})
        let songHTML = songs.map(song => {
            return `
            <img src="${song.album_img}" alt="${song.album_name}" height="100px"/>
            <div class="dataDiv">
                <span>Song: ${song.track_name}</span>
                <span>Album: ${song.album_name}</span>
                <span>Gloom Index: ${song.gloom_index}</span>
            </div>
            `
        })
        res.render('songs', {songs: songHTML })
});

dataRoutes.get('/recommend/:latitude/:longitude',
    checkAuth,
    async function(req, res){
        const latitude = req.params.latitude
        const longitude = req.params.longitude
        let weatherData = await getWeather(latitude, longitude)
        let gloom = calcWeatherGloomIndex(weatherData)
        let songData  = await matchWeatherToSong(gloom.value)
        weatherData['gloom'] = gloom
        response = {
            weather: weatherData,
            song: songData
        }
	    res.send(JSON.stringify(response))
});

async function getWeather(latitude, longitude) {
    const response = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    const weatherData = await response.json()
    const forecast = weatherData.properties.forecast
    const location = weatherData.properties.relativeLocation
    const forecastResponse = await fetch(forecast)
    const forecastData = await forecastResponse.json()
    const closeForecast = forecastData.properties.periods[0]
    closeForecast['city'] = location.properties.city
    closeForecast['state'] = location.properties.state
    return closeForecast
}

// This is my algorithm for determining how depressing the weather is.
// It is entirely subjective and probably not a very good algorithm
// 1 = maximum depression, 100 = perfect day
function calcWeatherGloomIndex(weatherData) {
    const perfectTemp = 75
    let weatherOffset = ''
    if (weatherData.temperature > perfectTemp) {
        weatherOffset = 'hot'
    } else if (weatherData.temperature < perfectTemp) {
        weatherOffset = 'cold'
    }
    preciPct = weatherData.probabilityOfPrecipitation.value > 0 ? weatherData.probabilityOfPrecipitation.value : 0
    let gloom = preciPct > 0 ? (50 / preciPct) : 50
    let desc = 'It is a perfect day'
    let adj = ''
    if (preciPct > 40) {
        adj = ' and gloomy'
    } else if (preciPct > 40) {
        adj = ' and a little gloomy'
    }
    if (weatherOffset == 'hot') {
        let diff = (2 * (weatherData.temperature - perfectTemp))
        if (diff > 40) {
            desc = 'It is too hot'
        } else if (diff > 20) {
            desc = 'It is slightly too hot'
        } else {
            desc = 'It is a nice warm day'
        }
        gloom += 50 - diff
    } else if (weatherOffset == 'cold') {
        let diff = perfectTemp - weatherData.temperature
        if (diff > 50) {
            desc = 'It is too cold'
        } else if (diff > 25) {
            desc = 'It is slightly too cold'
        } else {
            desc = 'It is a nice chill day'
        }
        gloom += 50 - diff
    } else {
        gloom += 50
    }
    if (gloom < 1) {
        gloom = 1
    }
    return {
        'value': gloom,
        'desc': (desc + adj) 
    }
}

async function matchWeatherToSong(weatherGloomIndex) {
    let overMatch = await Song.find({gloom_index : {$gte: weatherGloomIndex}}).sort({gloom_index: 1}).limit(1)
    let underMatch = await Song.find({gloom_index : {$lte: weatherGloomIndex}}).sort({gloom_index: -1}).limit(1)
    if ((weatherGloomIndex - underMatch[0].gloom_index) < (overMatch[0].gloom_index - weatherGloomIndex)) {
        return underMatch[0]
    } else {
        return overMatch[0]
    }
}

module.exports = { Song, dataRoutes }
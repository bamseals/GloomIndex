const mongoose = require('mongoose')
const { Schema } = mongoose
const fs = require('fs');
const csv = require('csv-parser');

const url = 'mongodb+srv://bealssa:Porpoise08@samcluster.atipphu.mongodb.net/radiohead?retryWrites=true&w=majority'
const csvFilePath = './gloom_index.csv';

try {
    mongoose.connect(url)
} catch(e) {
    console.log(e)
}

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

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    console.log(row)
    // Create a new instance of your model using the row data
    const instance = new Song(row);
    // Save the instance to the database
    instance.save();
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    // Disconnect from the database after import completion
    // mongoose.disconnect();
  });

const mongoose = require('mongoose')

const URI = 'mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb';

const connectURI = async () => {
    await mongoose.connect(URI,{ useNewUrlParser: true, useUnifiedTopology: true });
    console.log("DB Connected")
}

module.exports = connectURI;
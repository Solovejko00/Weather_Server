const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

let myKey = '0b5edc7455a336d544760ce639198bc9';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const dataBaseUrl = 'mongodb+srv://Solovejko:235689124578@cluster0.4fi9y.mongodb.net/DataBaseCities?retryWrites=true&w=majority'

mongoose.connect(dataBaseUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if (err)
        console.error(err);
    else
        console.log('Successfully connected');
});

const citySchema = new mongoose.Schema ({
    _id: String,
    name: String
});

const city = mongoose.model('city', citySchema);

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set("Access-Control-Allow-Methods", "*");
    res.set('Access-Control-Allow-Headers', 'origin, content-type, accept');

    console.log('Запрос разрешен');
    res.sendStatus(200);
});

app.route('/favorites')
    .get((req, res) => {
        res.set('Access-Control-Allow-Origin', '*');

        city.find()
            .exec((err, cities) => {
                if (err)
                    res.send(err);

                if (cities){
                    res.send(cities);
                    console.log('Get /favorites');
                }
            });
    })
    .post((req, res) => {
        res.set("Access-Control-Allow-Origin", '*');

        const cityId = Date.now().toString();

        let favorite = new city({
            _id: cityId,
            name: req.body.name
        });

        favorite.save(err => {
            if (err)
                res.send(err);
            else {
                res.send({_id: Date.now()});
                console.log('Post /favorites');
            }
        });
    })
    .delete((req, res) => {
        res.set('Access-Control-Allow-Origin', '*');

        city.deleteOne({_id: req.body.id}, (err) => {
            if (err)
                res.send(err);
            else {
                res.sendStatus(200);
                console.log('Delete /favorites');
            }
        });
    });

app.get('/weather/city', (req, res) => {
    const nameCity = req.query.q;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(nameCity)}&appid=${myKey}&units=metric&lang=ru`;
    res.set('Access-Control-Allow-Origin', '*');

    fetch(url)
        .then(res => res.json())
        .then(json => {
            res.send(json)
            console.log('get /weather/city');
        })
        .catch(err => res.send(err));
})

app.get('/weather/coordinates', (req, res) => {
    const x = req.query.lat;
    const y = req.query.lon;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${x}&lon=${y}&appid=${myKey}&units=metric&lang=ru`;
    res.set('Access-Control-Allow-Origin', '*');

    fetch(url)
        .then(res => res.json())
        .then(json => {
            res.send(json);
            console.log('get /weather/coordinates');
        })
        .catch(err => res.send(err));
})

app.listen(3000, () => {
    console.log('Server started');
})
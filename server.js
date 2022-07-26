const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mysql = require("mysql");

let myKey = '0b5edc7455a336d544760ce639198bc9';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const connection = mysql.createConnection({
    host: "sql8.freesqldatabase.com",
    user: "sql8508900",
    database: "sql8508900",
    password: "WxKNnzCbIT"
});

connection.connect(function(err){
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});

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

        connection.query('SELECT * FROM city', (err, cities) => {
                if (err)
                    res.send(err);

                if (cities){
                    for (var i = 0; i < cities.length; i++)
                        cities[i].name = translit(cities[i].name, true);

                    res.send(cities);
                    console.log('Get /favorites');
                }
            });
    })
    .post((req, res) => {
        res.set("Access-Control-Allow-Origin", '*');

        const cityId = Date.now().toString();
        req.body.name = translit(req.body.name);

        connection.query('INSERT INTO city (_id, name) VALUES (?, ?)', [cityId, req.body.name], err => {
            if (err)
                res.send(err);
            else {
                res.send({_id: cityId});
                console.log('Post /favorites');
            }
        });
    })
    .delete((req, res) => {
        res.set('Access-Control-Allow-Origin', '*');

        connection.query('DELETE FROM `city` WHERE _id = ?', req.body.id, err => {
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

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
})

function translit(word, en){
    let i;
    let answer = '';
    const converter = {
        'а': '10', 'б': '17', 'в': '24', 'г': '31', 'д': '37',
        'е': '11', 'ё': '18', 'ж': '25', 'з': '32', 'и': '38',
        'й': '12', 'к': '19', 'л': '26', 'м': '33', 'н': '39',
        'о': '13', 'п': '20', 'р': '27', 'с': '34', 'т': '40',
        'у': '14', 'ф': '21', 'х': '28', 'ц': '35', 'ч': '41',
        'ш': '15', 'щ': '22', 'ь': '29', 'ы': '36', 'ъ': '42',
        'э': '16', 'ю': '23', 'я': '30',

        'А': '43', 'Б': '50', 'В': '57', 'Г': '64', 'Д': '70',
        'Е': '44', 'Ё': '51', 'Ж': '58', 'З': '65', 'И': '71',
        'Й': '45', 'К': '52', 'Л': '59', 'М': '66', 'Н': '72',
        'О': '46', 'П': '53', 'Р': '60', 'С': '67', 'Т': '73',
        'У': '47', 'Ф': '54', 'Х': '61', 'Ц': '68', 'Ч': '74',
        'Ш': '48', 'Щ': '55', 'Ь': '62', 'Ы': '69', 'Ъ': '75',
        'Э': '49', 'Ю': '56', 'Я': '63',

        '10': 'а', '17': 'б', '24': 'в', '31': 'г', '37': 'д',
        '11': 'е', '18': 'ё', '25': 'ж', '32': 'з', '38': 'и',
        '12': 'й', '19': 'к', '26': 'л', '33': 'м', '39': 'н',
        '13': 'о', '20': 'п', '27': 'р', '34': 'с', '40': 'т',
        '14': 'у', '21': 'ф', '28': 'х', '35': 'ц', '41': 'ч',
        '15': 'ш', '22': 'щ', '29': 'ь', '36': 'ы', '42': 'ъ',
        '16': 'э', '23': 'ю', '30': 'я',

        '43': 'А', '50': 'Б', '57': 'В', '64': 'Г', '70': 'Д',
        '44': 'Е', '51': 'Ё', '58': 'Ж', '65': 'З', '71': 'И',
        '45': 'Й', '52': 'К', '59': 'Л', '66': 'М', '72': 'Н',
        '46': 'О', '53': 'П', '60': 'Р', '67': 'С', '73': 'Т',
        '47': 'У', '54': 'Ф', '61': 'Х', '68': 'Ц', '74': 'Ч',
        '48': 'Ш', '55': 'Щ', '62': 'Ь', '69': 'Ы', '75': 'Ъ',
        '49': 'Э', '56': 'Ю', '63': 'Я'
    };

    if (en){
        i = 0;
        while (i < word.length){
            if (converter[word[i] + word[i + 1]] === undefined){
                answer += word[i];
                i++;
            } else {
                answer += converter[word[i] + word[i + 1]];
                i+=2;
            }
        }
    } else {
        for (i = 0; i < word.length; ++i) {
            if (converter[word[i]] === undefined) {
                answer += word[i];
            } else {
                answer += converter[word[i]];
            }
        }
    }

    return answer;
}

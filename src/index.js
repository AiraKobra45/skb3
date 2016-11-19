import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import fetch from 'isomorphic-fetch';
//import fetch from 'isomorphic-fetch';
//require('es6-promise').polyfill();
//require('isomorphic-fetch');

import saveDataInDb from './saveDataInDb';
import Pet from './models/Pet';
import User from './models/User';
import isAdmin from './middlewares/isAdmin';

mongoose.Promise = Promise;
mongoose.connect('mongodb://publicdb.mgbeta.ru/airakobra45_skb3');

const app = express();
app.use(cors());
app.use(bodyParser.json());
//app.use(isAdmin);

app.get('/clear', isAdmin, async(req, res) => {
  await User.remove({});
  await Pet.remove({});
  return res.send('OK');
});
app.get('/users', async(req, res) => {
  const users = await User.find();
  return res.json(users);
});
app.get('/pets', async(req, res) => {
  const pets = await Pet.find().populate('owner');
  return res.json(pets); //json(pets.slice(+pets.length-2)
});
app.post('/data', async(req, res) => {
  const data = req.body;
  if (!data.user) return res.status(400).send('User required');
  if (!data.pets) data.pets = [];

  const user = await User.findOne({
    name: data.user.name,
  });
  if (user) return res.status(400).send('User: "' + user.name + '" is exists!');

  try {
    const result = await saveDataInDb(data);
    return res.json(result);
  } catch (err) {

    return res.status(500).json(err);
  }

});

const pcUrl = 'https://gist.githubusercontent.com/isuvorov/ce6b8d87983611482aac89f6d7bc0037/raw/pc.json';

let pc = {};
fetch(pcUrl)
  .then(async (res) => {
    pc = await res.json();
  })
  .catch(err => {
    console.log('Что-то пошло не так:', err);
  });

app.get('/task3A', async(req, res) => {
  return await res.json(pc);
});

app.get('/task3A/:id1', async(req, res) => {
  const id = req.params;
  if (id.id1 === 'volumes') {
    return res.json(volume());//await res.json({"C:":"41943040B","D:":"16777216B", "len": len})
  } else {
    const ans = pc[id.id1];
    if (ans === undefined) {
      return await res.status(404).send('Not Found');
    } else {
      return await res.json(ans);
    }
  }
});

app.get('/task3A/:id1/:id2', async(req, res) => {
  const id = req.params;
  if ((id.id1 !== 'length') && (id.id2 !== 'length')) {
    try {
      const ans = pc[id.id1][id.id2];
      if (ans === undefined) {
        return await res.status(404).send('Not Found');
      } else {
        return await res.json(ans);
      }
    } catch (err) {
      return await res.status(404).send('Not Found');
    }
  } else {
    return await res.status(404).send('Not Found');
  }
});

app.get('/task3A/:id1/:id2/:id3', async(req, res) => {
  const id = req.params;
  if ((id.id1 !== 'length') && (id.id2 !== 'length') && (id.id3 !== 'length')) {
    try {
      const ans = pc[id.id1][id.id2][id.id3];
      if (ans === undefined) {
        return await res.status(404).send('Not Found');
      } else {
        return await res.json(ans);
      }
    } catch (err) {
      return await res.status(404).send('Not Found');
    }
  } else {
    return await res.status(404).send('Not Found');
  }
});

function volume() {
  var result = {};
  pc.hdd.forEach(drive => result[drive.volume] = (result[drive.volume] || 0) + drive.size);
  for (var drive in result) {
    result[drive] = result[drive] + 'B';
  }
  return result;
}


app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

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
//
/////////   TASK 3B    /////////   TASK 3B    /////////   TASK 3B    /////////   TASK 3B    /////////
//

const pcUrl2 = 'https://gist.githubusercontent.com/isuvorov/55f38b82ce263836dadc0503845db4da/raw/pets.json';

let base = {};
fetch(pcUrl2)
  .then(async (res) => {
    base = await res.json();
  })
  .catch(err => {
    console.log('Что-то пошло не так: 2', err);
  });

app.get('/task3B', async(req, res) => {
  return await res.json(base);

});

app.get('/task3B/users', async(req, res) => {
  return await res.json(base.users);

});
/*
app.get('/task3B/pets', async(req, res) => {
  const type = req.query.type;
  let len = base.pets.length;
  let timeBase = [];
  if (type === 'cat') {
    for (var i = 0; i < len;  i++) {
      if (base.pets[i].type === 'cat') {
        timeBase.push(base.pets[i]);
      }
    }
   return res.json((timeBase));
  } else  return await res.send(base.pets);
});*/

app.get('/task3B/pets', async(req, res) => {
  const type = req.query.type;
  const age_gt = req.query.age_gt;
  const age_lt = req.query.age_lt;
  //console.log('* '+ type + '* '+ age_gt + '* '+ age_lt);
  //console.log('Start');
  if (type) {//console.log('1');
    //return await res.json(getPets(base.pets, type, age_gt));
    if (age_gt && !age_lt) { //console.log('2');
      return await res.json(getPets(getPetsAge(base.pets, age_gt, true), type));
    } else if (age_lt && !age_gt) {//console.log('3');
      return await res.json(getPets(getPetsAge(base.pets, age_lt, false), type));
    } else if (age_lt && age_gt) {//console.log('4');
      return await res.json(getPets(getPetsAge(getPetsAge(base.pets,age_lt, false),age_gt,true), type));
    } else //console.log('Type');
      return await res.json(getPets(base.pets, type));
  } else if (age_gt && !age_lt) { //console.log('5');
    return await res.json(getPetsAge(base.pets, age_gt, true));
  } else if (age_lt && !age_gt) {//console.log('6');
    return await res.json(getPetsAge(base.pets, age_lt, false));
  } else //console.log('7');
    return await res.json(base.pets);
  //console.log('The End');
});

function getPetsAge(base0, age1, bool) {
  let base1 = base0;
  let len = base1.length;
  let timeBase = [];
  let age = +age1;
  for (var i = 0; i < len;  i++) {
    switch (bool) {
      case true:
        if (base1[i].age > age) {
          timeBase.push(base1[i]);
          //console.log(base1[i].id + '_' + base1[i].age + '>' + age);
          }
        break;
      case false:
        if (base1[i].age < age) {
          timeBase.push(base1[i]);
          //console.log(base1[i].id + '_' +base1[i].age + '<' + age);
        }
        break;
    }
  }
  return timeBase;
}

function getPets(base1, pet) {
  let len = base1.length;
  let timeBase = [];
  for (var i = 0; i < len;  i++) {
    if (base1[i].type == pet) {
      console.log(base1[i]);
      timeBase.push(base1[i]);
    }
  }
  return timeBase;
}
/*
function getPets(base1, pet, age1) {
  let len = base1.length;
  let timeBase = [];
  let age = +age1;
  for (var i = 0; i < len;  i++) {
    if (base1[i].type == pet) {
      if ((0 < age) && (age < base1[i].age) ) {
        timeBase.push(base1[i]);
      }
    }
  }
  return timeBase;
}
*/
app.get('/task3B/pets/:id1', async(req, res) => {
  const id = req.params;
  console.log(id);
  if (base.pets[id.id1 - 1]) {
    return await res.json(base['pets'][id.id1-1]);
  } else  return await res.status(404).send('Not Found');
});

app.get('/task3B/users/:id1', async(req, res) => {
  const id = req.params;
  console.log(id);
  if (base.users[id.id1 - 1]) {
    return await res.json(base['users'][id.id1-1]);
  } else  return await res.status(404).send('Not Found');

});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

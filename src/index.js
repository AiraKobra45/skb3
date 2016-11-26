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
  //console.log('1');
  const type = req.query.havePet;
  if (type) {
    //console.log('2');
    return await res.json(usersHavePet(type));
  } else {
    //console.log('3');
    return await res.json(base.users);
  }

});

function usersHavePet( type ) {
  console.log('type: ' + type);
  let timeBase = [];
  let usersLen = base.users.length;
  let petsLen = base.pets.length;
  console.log( usersLen + '_' + petsLen);
  for (var ii = 0; ii < usersLen; ii++) {
    console.log('2*2');
    let user =  base.users[ii];
    console.log(user);
    for (var vi = 0; vi < petsLen; vi++) {
      console.log(ii + '_*_' + vi);
      let pet = base.pets;
      //console.log(pet);
      if ( user.id == pet[vi].userId) {
        //break;
        console.log('2*4');
        console.log(ii + '_' + vi);
        if (pet[vi].type == type) {
          console.log('2*5');
          timeBase.push(user);
          break;
          console.log(base.users[ii].Id + '___' + base.pets[vi].userId);
          console.log( base.pets[vi].type + '______' + type );
          //console.log(timeBase);
        }
        //break;
      } //else break;

    }
  }
  return timeBase;
  console.log(timeBase);
}

app.get('/task3B/pets', async(req, res) => {
  const type = req.query.type;
  const age_gt = req.query.age_gt;
  const age_lt = req.query.age_lt;
  if (type) {
    if (age_gt && !age_lt) {
      return await res.json(getPets(getPetsAge(base.pets, age_gt, true), type));
    } else if (age_lt && !age_gt) {
      return await res.json(getPets(getPetsAge(base.pets, age_lt, false), type));
    } else if (age_lt && age_gt) {
      return await res.json(getPets(getPetsAge(getPetsAge(base.pets,age_lt, false),age_gt,true), type));
    } else
      return await res.json(getPets(base.pets, type));
  } else if (age_gt && !age_lt) {
    return await res.json(getPetsAge(base.pets, age_gt, true));
  } else if (age_lt && !age_gt) {
    return await res.json(getPetsAge(base.pets, age_lt, false));
  } else
    return await res.json(base.pets);
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
          }
        break;
      case false:
        if (base1[i].age < age) {
          timeBase.push(base1[i]);
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
      //console.log(base1[i]);
      timeBase.push(base1[i]);
    }
  }
  return timeBase;
}

app.get('/task3B/pets/:id1', async(req, res) => {
  const type = req.query.type;
  const age_gt = req.query.age_gt;
  const age_lt = req.query.age_lt;
  const id = req.params.id1;
  const pet = base.pets;
  const user = base.users;
  //const userLen = user.length;
  const petLen = pet.length;

  let ans = null;

  if (!isNaN(id)) {
    for (var ic = 0; ic < petLen; ic++) {
      //console.log('_'+ic);
      if (pet[ic].id == id) {
        //console.log(pet[ic]);
        ans = pet[ic];
        break;
      }
    }
    if (ans) {
      return await res.json(ans);
    } else return await res.status(404).send('Not Found');
  } else
    if (id === 'populate') {
      let temp_base = base.pets;
      if (!isNaN(age_gt)) temp_base = getPetsAge(temp_base, age_gt, true);
      if (!isNaN(age_lt)) temp_base = getPetsAge(temp_base, age_lt, false);
      if (type)           temp_base = getPets(temp_base, type);
      //console.log(temp_base);

    let ans = getPopulate(temp_base/*, type, age_gt, age_lt*/);
    if (ans) {
      return await res.json(ans);
    } else return await res.status(404).send('Not Found');
  }
});

app.get('/task3B/pets/:id1/populate', async(req, res) => {
  const type = req.query.type;
  const age_gt = req.query.age_gt;
  const age_lt = req.query.age_lt;
  const id = req.params.id1;
  const pet = base.pets;
  const user = base.users;
  //const userLen = user.length;
  const petLen = pet.length;
  let ans = [];

  if (!isNaN(id)) {
    for (var ic = 0; ic < petLen; ic++) {
      //console.log('_'+ic);
      if (pet[ic].id == id) {
        ans.push(pet[ic]);
        //console.log(ans);
        break;
      }
    }
    if (ans) {
      console.log(getPopulate(ans)[0]);
      return await res.json(getPopulate(ans)[0]);
    } else return await res.status(404).send('Not Found');
  } /*else
  if (id === 'populate') {
    let temp_base = base.pets;
    if (!isNaN(age_gt)) temp_base = getPetsAge(temp_base, age_gt, true);
    if (!isNaN(age_lt)) temp_base = getPetsAge(temp_base, age_lt, false);
    if (type)           temp_base = getPets(temp_base, type);
    //console.log(temp_base);

    let ans = getPopulate(temp_base//, type, age_gt, age_lt);
    if (ans) {
      return await res.json(ans);
    } else return await res.status(404).send('Not Found');
  }*/

});

function getPopulate(baseP/*, typeP, age_gtP, age_ltP*/) {
  const pet = baseP;
  const user = base.users;
  const userLen = user.length;
  const petLen = pet.length;
  let ans0 = '';
  for (var i = 0; i < petLen; i++) {
    for (var v = 0; v < userLen; v++) {

      if (pet[i].userId === user[v].id) {
        //let l = ;
        ans0 += JSON.stringify(pet[i]).slice(0,-1) + ',"user":' + JSON.stringify(user[v]) + '},';
        //console.log('temp_' + i + '_' + v);
        break;
      }
    }
  }
  //console.log('[' + ans.slice(0,-1) + ']');
  //ans0 = ;
  return JSON.parse('[' + ans0.slice(0,-1) + ']');
  //return await res.status(404).send('Not Found');
}
function getPopulate2(baseP/*, typeP, age_gtP, age_ltP*/) {
  const pet = baseP;
  const user = base.users;
  const userLen = user.length;
  const petLen = pet.length;
  let ans0 = '';
  for (var i = 0; i < petLen; i++) {
    for (var v = 0; v < userLen; v++) {

      if (pet[i].userId === user[v].id) {
        //let l = ;
        ans0 += JSON.stringify(pet[i]).slice(0,-1) + ',"user":' + JSON.stringify(user[v]) + '},';
        //console.log('temp_' + i + '_' + v);
        break;
      }
    }
  }
  //console.log('[' + ans.slice(0,-1) + ']');
  //ans0 = ;
  return JSON.parse('[' + ans0.slice(0,-1) + ']');
  //return await res.status(404).send('Not Found');
}

app.get('/task3B/users/:id1', async(req, res) => {
  const id = req.params.id1;
  const user = base.users;
  const len = user.length;
  let ans = null;
  console.log('id_'+ id);
  if (isNaN(+id)) {
    console.log('NaN')
    for (var i = 0; i < len; i++) {
      console.log('*'+i);
      if (user[i].username == id) {
        console.log(user[i]);
        ans = user[i];
        break;
      }
    }
    if (ans) {
      return await res.json(ans);
    } else return await res.status(404).send('Not Found');
  } else if (id === 'populate') {
    for (var i = 0; i < len; i++) {
      console.log('_'+i);
      if (user[i].id == id) {
        console.log(user[i]);
        ans = user[i];
        break;
      }
    }
    if (ans) {
      return await res.json(ans);
    } else return await res.status(404).send('Not Found');
  }
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

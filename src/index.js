import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';
const __DEV__ = true;
const pages_num = 2;
var offSet;

const baseUrl = 'https://pokeapi.co/api/v2';
const pokemonFields = ['id','name','weight','height','base_experience','is_default','order'];

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
/*
let base = {};
fetch(pcUrl2)
  .then(async (res) => {
    base = await res.json();
  })
  .catch(err => {
    console.log('Что-то пошло не так: 2', err);
  });
*/
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
  //console.log('type: ' + type);
  let timeBase = [];
  let usersLen = base.users.length;
  let petsLen = base.pets.length;
  //console.log( usersLen + '_' + petsLen);
  for (var ii = 0; ii < usersLen; ii++) {
    //console.log('2*2');
    let user =  base.users[ii];
    //console.log(user);
    for (var vi = 0; vi < petsLen; vi++) {
      //console.log(ii + '_*_' + vi);
      let pet = base.pets;
      //console.log(pet);
      if ( user.id == pet[vi].userId) {
        //break;
        //console.log('2*4');
        //console.log(ii + '_' + vi);
        if (pet[vi].type == type) {
          //console.log('2*5');
          timeBase.push(user);
          break;
          //console.log(base.users[ii].Id + '___' + base.pets[vi].userId);
          //console.log( base.pets[vi].type + '______' + type );
          //console.log(timeBase);
        }
        //break;
      } //else break;

    }
  }
  //console.log(timeBase);
  return timeBase;
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
      //console.log(getPopulate(ans)[0]);
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

function getPopulate2() {
  const pet = base.pets;
  const user = base.users;
  const userLen = user.length;
  const petLen = pet.length;
  let ans0 = '\n\n\n [';
  console.log('[');
  for (var i = 0; i < userLen; i++) {
    ans0 += JSON.stringify(user[i]).slice(0,-1) + ',\n"pets":[';
    for (var j = 0; j < petLen; j++) {
      if (pet[j].userId === user[i].id) {
        ans0 += JSON.stringify(pet[j]) + ',';
      }
    }
    ans0 = ans0.slice(0,-1) + ']},';
  }
  ans0 = ans0.slice(0,-1) + ']';
  ans0 = JSON.parse(ans0);
  return ans0;
}

function havePet (base0, type) {
  const baseLen = base0.length;
  console.log(baseLen);
  let ans0 = [];
  for (var i = 0; i < baseLen; i++) {
    const petsLen = base0[i].pets.length;
      for (var j = 0; j < petsLen; j++) {
      if (base0[i].pets[j].type === type) {
        ans0.push(base0[i]);
        break;
      }
    }
  }
  return ans0;
}

/*
function getPopulate3 (baseP/*, typeP, age_gtP, age_ltP*///) {
/*  const petLen = base.pets.length;
  let ans0 = '';
  //console.log('getPopulate2_' + baseP.length);
/*  for (var i = 0; i < baseP.length; i++) {
    //console.log('for i _ ' + i);
    let tempUser = getUserById(baseP[i].userId);
    console.log(tempUser);
    console.log(JSON.stringify(tempUser).slice(0,-1) + ',"pets":[');//baseP.length + '000_' + tempUser + '_' + pet[i].userId);//
    ans0 += JSON.stringify(tempUser).slice(0,-1) + ',"pets":[';
    for (var v = 0; v < petLen; v++) {
      //console.log('for v _ ' + v);
   /*   if (base.pets[v].userId === tempUser.id) {
        //console.log('if central' );
        ans0 += JSON.stringify(pet[v]) + ',';
        //console.log('temp_' + i + '_' + v);
        //break;
        //JSON.stringify(user[i]).slice(0,-1) + ','
      }
    }
    //console.log(ans0.slice(0,-1) + ']},');
    ans0 = ans0.slice(0,-1) + ']},';
  }
  //console.log('[' + ans.slice(0,-1) + ']');
  //ans0 = ;
 /* return JSON.parse('[' + ans0.slice(0,-1) + ']');
  //return await res.status(404).send('Not Found');
}*/

function getUserById(id_) {
  let tempUser = base.users;
  for (var i = 0; i < tempUser.length; i++) {
    console.log('*'+i);
    console.log(tempUser[i]);
    if (tempUser[i].id == id_) {
      console.log('OK');
      return tempUser[i];
      //break;
    }
  }
}
/*
function getPopById(id_) {
  let tempUser = getPopulate2();
  let len = tempUser.length;
  let ans = null;
  for (var i = 0; i < tempUser.length; i++) {
    //console.log('*'+i);
    console.log(tempUser[i]);
    if (tempUser[i].id == id_) {
      console.log('OK');
      ans = tempUser[i];
      break;
    }
  }
  if (ans) {return ans} else {return undefined};
}*/

function getPopById(id_) {
  let tempUser = getPopulate2();
  let len = tempUser.length;
  let ans = undefined;
  if (!isNaN(id_)) {
    for (var i = 0; i < len; i++) {
      if (tempUser[i].id == id_) {
        console.log('OK_id');
        ans = tempUser[i];
        break;
      }
    }
  } else {
    for (var j = 0; j < len; j++) {
      console.log(tempUser[j]);
      if (tempUser[j].username == id_) {
        console.log('OK_name');
        ans = tempUser[j];
        console.log(tempUser);
        break;
      }
    }
  }
  return ans;
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

app.get('/task3B/users/:id1/populate', async(req, res) => {
  //console.log('test 56');
  const id = req.params.id1;
  //console.log(id);
  let ans = [];
  if (id) {
    ans = getPopById(id);
  }
  if (ans) {
    return await res.json(ans);
  } else return await res.status(404).send('Not Found');
});

app.get('/task3B/users/:id1', async(req, res) => {
  const have_pet = req.query.havePet;
  const id = req.params.id1;
  const user = base.users;
  const len = user.length;
  let ans = null;
  console.log(!isNaN(7) + '_id_'+ id );
  if (!isNaN(id)) {
    console.log('isNaN');
    ans = getUserById(id);
    console.log(getUserById(id));
  } else if (id === 'populate') {
    if (have_pet) {
      console.log('populate_pet');
      //let gp = getPets(base, have_pet);
      //console.log(getPopulate2(base, have_pet));
      //console.log(getUserById(5));
      //console.log(base.users[6]);
      //console.log(havePet(getPopulate2(), have_pet)[0]);
      ans = (havePet(getPopulate2(), have_pet));
      //console.log(getPets(base.pets, have_pet)[2]);
      //ans = getPopulate2(base, have_pet);//gpp2;//getPopulate2(getPets(base, have_pet));
      //console.log(ans);
    } else {
      console.log('populate1');
      ans = getPopulate2();
      //console.log(ans);
    }
  } else {
    console.log('username');
      for (var i = 0; i < len; i++) {
        console.log('*'+i);
        if (user[i].username == id) {
          console.log(user[i]);
          /*if (!ans)*/ ans = user[i];
          //else ans.push(user[i]);
          break;
        }
      }
  }
  if (ans) {
    return await res.json(ans);
  } else return await res.status(404).send('Not Found');
});

let base = {
  "users": [
    {
      "id": 1,
      "username": "greenday",
      "fullname": "Billie Joe Armstrong",
      "password": "Sweet Children",
      "values": {
        "money": "200042$",
        "origin": "East Bay, California, United States"
      }
    },
    {
      "id": 2,
      "username": "offspring",
      "fullname": "Dexter Holland",
      "password": "Manic Subsidal",
      "values": {
        "money": "100042$",
        "origin": "Huntington Beach, California, United States"
      }
    },
    {
      "id": 3,
      "username": "blink",
      "fullname": "Mark Hoppus",
      "password": "Tom DeLonge",
      "values": {
        "money": "200202$",
        "origin": "Poway, California, United States"
      }
    },
    {
      "id": 4,
      "username": "blink",
      "fullname": "Mark Hoppus",
      "password": "Tom DeLonge",
      "values": {
        "money": "107321$",
        "origin": "Poway, California, United States"
      }
    },
    {
      "id": 5,
      "username": "stones",
      "fullname": "Mick Jagger",
      "password": "The Stones",
      "values": {
        "money": "88632$",
        "origin": "London, England"
      }
    },
    {
      "id": 6,
      "username": "pistols",
      "fullname": "Ian Paice",
      "password": "Roundabout",
      "values": {
        "money": "387567$",
        "origin": "Hertford, Hertfordshire, England"
      }
    },
    {
      "id": 7,
      "username": "purple",
      "fullname": "Ian Paice",
      "password": "Tom DeLonge",
      "values": {
        "money": "280002$",
        "origin": "London, England"
      }
    },
    {
      "id": 8,
      "username": "nikolaev",
      "fullname": "Игорь Юрьевич Николаев",
      "password": "За любовь!",
      "values": {
        "money": "760835р",
        "origin": "Холмск, Сахалинская область, Россия"
      }
    }
  ],
  "pets": [
    {
      "id": 1,
      "userId": 1,
      "type": "dog",
      "color": "#f44242",
      "age": 1
    },
    {
      "id": 2,
      "userId": 2,
      "type": "dog",
      "color": "#4242f4",
      "age": 34
    },
    {
      "id": 3,
      "userId": 3,
      "type": "dog",
      "color": "#42f4c8",
      "age": 26
    },
    {
      "id": 4,
      "userId": 4,
      "type": "dog",
      "color": "#db7e12",
      "age": 10
    },
    {
      "id": 5,
      "userId": 5,
      "type": "dog",
      "color": "#f60cca",
      "age": 31
    },
    {
      "id": 6,
      "userId": 6,
      "type": "cat",
      "color": "#4242f4",
      "age": 19
    },
    {
      "id": 7,
      "userId": 7,
      "type": "dog",
      "color": "#4242f4",
      "age": 77
    },
    {
      "id": 8,
      "userId": 8,
      "type": "dog",
      "color": "#4242f4",
      "age": 20
    },
    {
      "id": 9,
      "userId": 8,
      "type": "rat",
      "color": "#f27497",
      "age": 15
    },
    {
      "id": 10,
      "userId": 4,
      "type": "rat",
      "color": "#fede13",
      "age": 15
    },
    {
      "id": 11,
      "userId": 1,
      "type": "cat",
      "color": "#143bf7",
      "age": 1
    },
    {
      "id": 12,
      "userId": 2,
      "type": "dog",
      "color": "#128215",
      "age": 34
    },
    {
      "id": 13,
      "userId": 3,
      "type": "dog",
      "color": "#f6cdbf",
      "age": 26
    },
    {
      "id": 14,
      "userId": 4,
      "type": "cat",
      "color": "#db7e12",
      "age": 10
    },
    {
      "id": 15,
      "userId": 5,
      "type": "dog",
      "color": "#aa74d6",
      "age": 31
    },
    {
      "id": 16,
      "userId": 6,
      "type": "dog",
      "color": "#4242f4",
      "age": 19
    },
    {
      "id": 17,
      "userId": 7,
      "type": "cat",
      "color": "#7fe16a",
      "age": 77
    },
    {
      "id": 18,
      "userId": 8,
      "type": "dog",
      "color": "#412753",
      "age": 20
    },
    {
      "id": 19,
      "userId": 8,
      "type": "rat",
      "color": "#9d054d",
      "age": 15
    },
    {
      "id": 20,
      "userId": 4,
      "type": "rat",
      "color": "#fd6a70",
      "age": 15
    }
  ]
};

//////////////  TASK3C   //////////////  TASK3C  //////////////  TASK3C  //////////////  TASK3C  //////////////  TASK3C

// pokemon
// pokemon/1
function getPok (arr, attr) {
  let out = [];
  const len = arr.length;
  for (var i = 0; i < len; i++) {
    let temp = [];
    temp.push(arr[i]);
    for (var j = i + 1; j < len; j++) {
      if (attr == 'angular') {
        if ((arr[i].weight/arr[i].height) == (arr[j].weight/arr[j].height)) {
          temp.push(arr[j]);
          i = j;
        }
      } else {
        if (arr[i][attr] == arr[j][attr]) {
          temp.push(arr[j]);
          i = j;
        }
      }

    }
    temp = _.sortBy(temp, pokemon => (pokemon.name));
    //console.log('temp');
    //console.log(temp);
    //console.log('\n*************************************\n');
    for (var c = 0; c < temp.length; c++) {
      out.push(temp[c].name);
    }
  }
  return out;
}
function getArr (arr, set, lim ) {
  const end = set + lim;
  arr = arr.slice(set, end);
  let out = [];
  const len = arr.length;
  for (var i = 0; i < len; i++) {
    out.push(arr[i].name);
  }
  return out;
}

app.get('/task3C', async (req, res) => {
  const offset = (+req.query.offset || 0);
  const limit = (+req.query.limit || 20);
  console.log(req.params);
  console.log(req.query);
  console.log('******************************************************');

  const sortPokemons = _.sortBy(pokemonsAPI, pokemon => (pokemon.name));
  return res.json( getArr(sortPokemons, offset, limit));

});

app.get('/task3C/:par1', async (req, res) => {
  console.log(req.params);
  console.log(req.query);
  console.log('******************************************************');
  const offset = (+req.query.offset || 0);
  const limit = (+req.query.limit || 20);

  switch (req.params.par1) {
    case 'huge': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => -(pokemon.height));
      sortPokemons = getPok(sortPokemons, 'height');
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
    case 'micro': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => (pokemon.height));
      sortPokemons = getPok(sortPokemons, 'height');
      console.log(offset + limit);
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
    case 'light': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => (pokemon.weight));
      sortPokemons = getPok(sortPokemons, 'weight');
      console.log(offset + limit);
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
    case 'heavy': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => -(pokemon.weight));
      sortPokemons = getPok(sortPokemons, 'weight');
      console.log(offset + limit);
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
    case 'angular': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => (pokemon.weight/pokemon.height));
      sortPokemons = getPok(sortPokemons, 'angular');
      console.log(offset + limit);
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
    case 'fat': {
      let sortPokemons = _.sortBy(pokemonsAPI, pokemon => -(pokemon.weight/pokemon.height));
      sortPokemons = getPok(sortPokemons, 'angular');
      console.log(offset + limit);
      return res.json( sortPokemons.slice(offset, offset + limit));//getArr(sortPokemons, offset, limit));
    }
  }

});

app.get('/task3C/getAllInfoPokemons', async (req, res) => {
  offSet = (req.query.offset || 0);
  try {
    const pokemonsUrl = `${baseUrl}/pokemon?offset=${offSet}`;
    const pokemonsInfo = await getPokemons(pokemonsUrl);
    const pokemonsPromises = pokemonsInfo.slice(0, ).map(info => {
      let pok1 = getPokemon(info.url);
      if (pok1) return pok1;
      else return getPokemon(info.url);
    });



    const pokemonsFull = await Promise.all(pokemonsPromises);
    const pokemons = pokemonsFull.map((pokemon) => {
      return _.pick(pokemon, pokemonFields);
    });
    const sortPokemons = pokemons;//_.sortBy(pokemons, pokemon => -(pokemon.base_experience));
    return res.json( sortPokemons);
  } catch (err) {
    console.log(err);
    return res.json({err});
  }

});

async function getPokemon(url) {
  console.log('getPokemon ', url);
  const response = await fetch(url);
  const pokemon = await response.json();
  return pokemon;
}

async function getPokemons(url, i = 1) {
  console.log('getPokemons ', url, i);
  const response = await fetch(url);
  //console.log(response);
  const page = await response.json();
  const pokemons = page.results;
  if (__DEV__  && i >= pages_num){
    return pokemons;
  }
  if (page.next) {
    const pokemons2 = await getPokemons(page.next, i + 1);
    return [
      ...pokemons,
      ...pokemons2
    ];

  }
  return pokemons;
}

app.listen(3000, () => {
  console.log('****************************************************************************************************************************************************************Your app listening on port 3000!');
});



//var pokAPI = ["abomasnow","abomasnow-mega","abra","absol","absol-mega","accelgor","aegislash-blade","aegislash-shield","aerodactyl","aerodactyl-mega","aggron","aggron-mega","aipom","alakazam","alakazam-mega","alomomola","altaria","altaria-mega","amaura","ambipom"];

var pokemonsAPI =
  [
    {
      "id": 1,
      "name": "bulbasaur",
      "weight": 69,
      "height": 7,
      "base_experience": 64,
      "is_default": true,
      "order": 1
    },
    {
      "id": 2,
      "name": "ivysaur",
      "weight": 130,
      "height": 10,
      "base_experience": 142,
      "is_default": true,
      "order": 2
    },
    {
      "id": 3,
      "name": "venusaur",
      "weight": 1000,
      "height": 20,
      "base_experience": 236,
      "is_default": true,
      "order": 3
    },
    {
      "id": 4,
      "name": "charmander",
      "weight": 85,
      "height": 6,
      "base_experience": 62,
      "is_default": true,
      "order": 5
    },
    {
      "id": 5,
      "name": "charmeleon",
      "weight": 190,
      "height": 11,
      "base_experience": 142,
      "is_default": true,
      "order": 6
    },
    {
      "id": 6,
      "name": "charizard",
      "weight": 905,
      "height": 17,
      "base_experience": 240,
      "is_default": true,
      "order": 7
    },
    {
      "id": 7,
      "name": "squirtle",
      "weight": 90,
      "height": 5,
      "base_experience": 63,
      "is_default": true,
      "order": 10
    },
    {
      "id": 8,
      "name": "wartortle",
      "weight": 225,
      "height": 10,
      "base_experience": 142,
      "is_default": true,
      "order": 11
    },
    {
      "id": 9,
      "name": "blastoise",
      "weight": 855,
      "height": 16,
      "base_experience": 239,
      "is_default": true,
      "order": 12
    },
    {
      "id": 10,
      "name": "caterpie",
      "weight": 29,
      "height": 3,
      "base_experience": 39,
      "is_default": true,
      "order": 14
    },
    {
      "id": 11,
      "name": "metapod",
      "weight": 99,
      "height": 7,
      "base_experience": 72,
      "is_default": true,
      "order": 15
    },
    {
      "id": 12,
      "name": "butterfree",
      "weight": 320,
      "height": 11,
      "base_experience": 178,
      "is_default": true,
      "order": 16
    },
    {
      "id": 13,
      "name": "weedle",
      "weight": 32,
      "height": 3,
      "base_experience": 39,
      "is_default": true,
      "order": 17
    },
    {
      "id": 14,
      "name": "kakuna",
      "weight": 100,
      "height": 6,
      "base_experience": 72,
      "is_default": true,
      "order": 18
    },
    {
      "id": 15,
      "name": "beedrill",
      "weight": 295,
      "height": 10,
      "base_experience": 178,
      "is_default": true,
      "order": 19
    },
    {
      "id": 16,
      "name": "pidgey",
      "weight": 18,
      "height": 3,
      "base_experience": 50,
      "is_default": true,
      "order": 21
    },
    {
      "id": 17,
      "name": "pidgeotto",
      "weight": 300,
      "height": 11,
      "base_experience": 122,
      "is_default": true,
      "order": 22
    },
    {
      "id": 18,
      "name": "pidgeot",
      "weight": 395,
      "height": 15,
      "base_experience": 216,
      "is_default": true,
      "order": 23
    },
    {
      "id": 19,
      "name": "rattata",
      "weight": 35,
      "height": 3,
      "base_experience": 51,
      "is_default": true,
      "order": 25
    },
    {
      "id": 20,
      "name": "raticate",
      "weight": 185,
      "height": 7,
      "base_experience": 145,
      "is_default": true,
      "order": 26
    },
    {
      "id": 21,
      "name": "spearow",
      "weight": 20,
      "height": 3,
      "base_experience": 52,
      "is_default": true,
      "order": 27
    },
    {
      "id": 22,
      "name": "fearow",
      "weight": 380,
      "height": 12,
      "base_experience": 155,
      "is_default": true,
      "order": 28
    },
    {
      "id": 23,
      "name": "ekans",
      "weight": 69,
      "height": 20,
      "base_experience": 58,
      "is_default": true,
      "order": 29
    },
    {
      "id": 24,
      "name": "arbok",
      "weight": 650,
      "height": 35,
      "base_experience": 153,
      "is_default": true,
      "order": 30
    },
    {
      "id": 25,
      "name": "pikachu",
      "weight": 60,
      "height": 4,
      "base_experience": 112,
      "is_default": true,
      "order": 32
    },
    {
      "id": 26,
      "name": "raichu",
      "weight": 300,
      "height": 8,
      "base_experience": 218,
      "is_default": true,
      "order": 39
    },
    {
      "id": 27,
      "name": "sandshrew",
      "weight": 120,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 40
    },
    {
      "id": 28,
      "name": "sandslash",
      "weight": 295,
      "height": 10,
      "base_experience": 158,
      "is_default": true,
      "order": 41
    },
    {
      "id": 29,
      "name": "nidoran-f",
      "weight": 70,
      "height": 4,
      "base_experience": 55,
      "is_default": true,
      "order": 42
    },
    {
      "id": 30,
      "name": "nidorina",
      "weight": 200,
      "height": 8,
      "base_experience": 128,
      "is_default": true,
      "order": 43
    },
    {
      "id": 31,
      "name": "nidoqueen",
      "weight": 600,
      "height": 13,
      "base_experience": 227,
      "is_default": true,
      "order": 44
    },
    {
      "id": 32,
      "name": "nidoran-m",
      "weight": 90,
      "height": 5,
      "base_experience": 55,
      "is_default": true,
      "order": 45
    },
    {
      "id": 33,
      "name": "nidorino",
      "weight": 195,
      "height": 9,
      "base_experience": 128,
      "is_default": true,
      "order": 46
    },
    {
      "id": 34,
      "name": "nidoking",
      "weight": 620,
      "height": 14,
      "base_experience": 227,
      "is_default": true,
      "order": 47
    },
    {
      "id": 35,
      "name": "clefairy",
      "weight": 75,
      "height": 6,
      "base_experience": 113,
      "is_default": true,
      "order": 49
    },
    {
      "id": 36,
      "name": "clefable",
      "weight": 400,
      "height": 13,
      "base_experience": 217,
      "is_default": true,
      "order": 50
    },
    {
      "id": 37,
      "name": "vulpix",
      "weight": 99,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 51
    },
    {
      "id": 38,
      "name": "ninetales",
      "weight": 199,
      "height": 11,
      "base_experience": 177,
      "is_default": true,
      "order": 52
    },
    {
      "id": 39,
      "name": "jigglypuff",
      "weight": 55,
      "height": 5,
      "base_experience": 95,
      "is_default": true,
      "order": 54
    },
    {
      "id": 40,
      "name": "wigglytuff",
      "weight": 120,
      "height": 10,
      "base_experience": 196,
      "is_default": true,
      "order": 55
    },
    {
      "id": 41,
      "name": "zubat",
      "weight": 75,
      "height": 8,
      "base_experience": 49,
      "is_default": true,
      "order": 56
    },
    {
      "id": 42,
      "name": "golbat",
      "weight": 550,
      "height": 16,
      "base_experience": 159,
      "is_default": true,
      "order": 57
    },
    {
      "id": 43,
      "name": "oddish",
      "weight": 54,
      "height": 5,
      "base_experience": 64,
      "is_default": true,
      "order": 59
    },
    {
      "id": 44,
      "name": "gloom",
      "weight": 86,
      "height": 8,
      "base_experience": 138,
      "is_default": true,
      "order": 60
    },
    {
      "id": 45,
      "name": "vileplume",
      "weight": 186,
      "height": 12,
      "base_experience": 221,
      "is_default": true,
      "order": 61
    },
    {
      "id": 46,
      "name": "paras",
      "weight": 54,
      "height": 3,
      "base_experience": 57,
      "is_default": true,
      "order": 63
    },
    {
      "id": 47,
      "name": "parasect",
      "weight": 295,
      "height": 10,
      "base_experience": 142,
      "is_default": true,
      "order": 64
    },
    {
      "id": 48,
      "name": "venonat",
      "weight": 300,
      "height": 10,
      "base_experience": 61,
      "is_default": true,
      "order": 65
    },
    {
      "id": 49,
      "name": "venomoth",
      "weight": 125,
      "height": 15,
      "base_experience": 158,
      "is_default": true,
      "order": 66
    },
    {
      "id": 50,
      "name": "diglett",
      "weight": 8,
      "height": 2,
      "base_experience": 53,
      "is_default": true,
      "order": 67
    },
    {
      "id": 51,
      "name": "dugtrio",
      "weight": 333,
      "height": 7,
      "base_experience": 142,
      "is_default": true,
      "order": 68
    },
    {
      "id": 52,
      "name": "meowth",
      "weight": 42,
      "height": 4,
      "base_experience": 58,
      "is_default": true,
      "order": 69
    },
    {
      "id": 53,
      "name": "persian",
      "weight": 320,
      "height": 10,
      "base_experience": 154,
      "is_default": true,
      "order": 70
    },
    {
      "id": 54,
      "name": "psyduck",
      "weight": 196,
      "height": 8,
      "base_experience": 64,
      "is_default": true,
      "order": 71
    },
    {
      "id": 55,
      "name": "golduck",
      "weight": 766,
      "height": 17,
      "base_experience": 175,
      "is_default": true,
      "order": 72
    },
    {
      "id": 56,
      "name": "mankey",
      "weight": 280,
      "height": 5,
      "base_experience": 61,
      "is_default": true,
      "order": 73
    },
    {
      "id": 57,
      "name": "primeape",
      "weight": 320,
      "height": 10,
      "base_experience": 159,
      "is_default": true,
      "order": 74
    },
    {
      "id": 58,
      "name": "growlithe",
      "weight": 190,
      "height": 7,
      "base_experience": 70,
      "is_default": true,
      "order": 75
    },
    {
      "id": 59,
      "name": "arcanine",
      "weight": 1550,
      "height": 19,
      "base_experience": 194,
      "is_default": true,
      "order": 76
    },
    {
      "id": 60,
      "name": "poliwag",
      "weight": 124,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 77
    },
    {
      "id": 61,
      "name": "poliwhirl",
      "weight": 200,
      "height": 10,
      "base_experience": 135,
      "is_default": true,
      "order": 78
    },
    {
      "id": 62,
      "name": "poliwrath",
      "weight": 540,
      "height": 13,
      "base_experience": 230,
      "is_default": true,
      "order": 79
    },
    {
      "id": 63,
      "name": "abra",
      "weight": 195,
      "height": 9,
      "base_experience": 62,
      "is_default": true,
      "order": 81
    },
    {
      "id": 64,
      "name": "kadabra",
      "weight": 565,
      "height": 13,
      "base_experience": 140,
      "is_default": true,
      "order": 82
    },
    {
      "id": 65,
      "name": "alakazam",
      "weight": 480,
      "height": 15,
      "base_experience": 225,
      "is_default": true,
      "order": 83
    },
    {
      "id": 66,
      "name": "machop",
      "weight": 195,
      "height": 8,
      "base_experience": 61,
      "is_default": true,
      "order": 85
    },
    {
      "id": 67,
      "name": "machoke",
      "weight": 705,
      "height": 15,
      "base_experience": 142,
      "is_default": true,
      "order": 86
    },
    {
      "id": 68,
      "name": "machamp",
      "weight": 1300,
      "height": 16,
      "base_experience": 227,
      "is_default": true,
      "order": 87
    },
    {
      "id": 69,
      "name": "bellsprout",
      "weight": 40,
      "height": 7,
      "base_experience": 60,
      "is_default": true,
      "order": 88
    },
    {
      "id": 70,
      "name": "weepinbell",
      "weight": 64,
      "height": 10,
      "base_experience": 137,
      "is_default": true,
      "order": 89
    },
    {
      "id": 71,
      "name": "victreebel",
      "weight": 155,
      "height": 17,
      "base_experience": 221,
      "is_default": true,
      "order": 90
    },
    {
      "id": 72,
      "name": "tentacool",
      "weight": 455,
      "height": 9,
      "base_experience": 67,
      "is_default": true,
      "order": 91
    },
    {
      "id": 73,
      "name": "tentacruel",
      "weight": 550,
      "height": 16,
      "base_experience": 180,
      "is_default": true,
      "order": 92
    },
    {
      "id": 74,
      "name": "geodude",
      "weight": 200,
      "height": 4,
      "base_experience": 60,
      "is_default": true,
      "order": 93
    },
    {
      "id": 75,
      "name": "graveler",
      "weight": 1050,
      "height": 10,
      "base_experience": 137,
      "is_default": true,
      "order": 94
    },
    {
      "id": 76,
      "name": "golem",
      "weight": 3000,
      "height": 14,
      "base_experience": 223,
      "is_default": true,
      "order": 95
    },
    {
      "id": 77,
      "name": "ponyta",
      "weight": 300,
      "height": 10,
      "base_experience": 82,
      "is_default": true,
      "order": 96
    },
    {
      "id": 78,
      "name": "rapidash",
      "weight": 950,
      "height": 17,
      "base_experience": 175,
      "is_default": true,
      "order": 97
    },
    {
      "id": 79,
      "name": "slowpoke",
      "weight": 360,
      "height": 12,
      "base_experience": 63,
      "is_default": true,
      "order": 98
    },
    {
      "id": 80,
      "name": "slowbro",
      "weight": 785,
      "height": 16,
      "base_experience": 172,
      "is_default": true,
      "order": 99
    },
    {
      "id": 81,
      "name": "magnemite",
      "weight": 60,
      "height": 3,
      "base_experience": 65,
      "is_default": true,
      "order": 102
    },
    {
      "id": 82,
      "name": "magneton",
      "weight": 600,
      "height": 10,
      "base_experience": 163,
      "is_default": true,
      "order": 103
    },
    {
      "id": 83,
      "name": "farfetchd",
      "weight": 150,
      "height": 8,
      "base_experience": 123,
      "is_default": true,
      "order": 105
    },
    {
      "id": 84,
      "name": "doduo",
      "weight": 392,
      "height": 14,
      "base_experience": 62,
      "is_default": true,
      "order": 106
    },
    {
      "id": 85,
      "name": "dodrio",
      "weight": 852,
      "height": 18,
      "base_experience": 161,
      "is_default": true,
      "order": 107
    },
    {
      "id": 86,
      "name": "seel",
      "weight": 900,
      "height": 11,
      "base_experience": 65,
      "is_default": true,
      "order": 108
    },
    {
      "id": 87,
      "name": "dewgong",
      "weight": 1200,
      "height": 17,
      "base_experience": 166,
      "is_default": true,
      "order": 109
    },
    {
      "id": 88,
      "name": "grimer",
      "weight": 300,
      "height": 9,
      "base_experience": 65,
      "is_default": true,
      "order": 110
    },
    {
      "id": 89,
      "name": "muk",
      "weight": 300,
      "height": 12,
      "base_experience": 175,
      "is_default": true,
      "order": 111
    },
    {
      "id": 90,
      "name": "shellder",
      "weight": 40,
      "height": 3,
      "base_experience": 61,
      "is_default": true,
      "order": 112
    },
    {
      "id": 91,
      "name": "cloyster",
      "weight": 1325,
      "height": 15,
      "base_experience": 184,
      "is_default": true,
      "order": 113
    },
    {
      "id": 92,
      "name": "gastly",
      "weight": 1,
      "height": 13,
      "base_experience": 62,
      "is_default": true,
      "order": 114
    },
    {
      "id": 93,
      "name": "haunter",
      "weight": 1,
      "height": 16,
      "base_experience": 142,
      "is_default": true,
      "order": 115
    },
    {
      "id": 94,
      "name": "gengar",
      "weight": 405,
      "height": 15,
      "base_experience": 225,
      "is_default": true,
      "order": 116
    },
    {
      "id": 95,
      "name": "onix",
      "weight": 2100,
      "height": 88,
      "base_experience": 77,
      "is_default": true,
      "order": 118
    },
    {
      "id": 96,
      "name": "drowzee",
      "weight": 324,
      "height": 10,
      "base_experience": 66,
      "is_default": true,
      "order": 121
    },
    {
      "id": 97,
      "name": "hypno",
      "weight": 756,
      "height": 16,
      "base_experience": 169,
      "is_default": true,
      "order": 122
    },
    {
      "id": 98,
      "name": "krabby",
      "weight": 65,
      "height": 4,
      "base_experience": 65,
      "is_default": true,
      "order": 123
    },
    {
      "id": 99,
      "name": "kingler",
      "weight": 600,
      "height": 13,
      "base_experience": 166,
      "is_default": true,
      "order": 124
    },
    {
      "id": 100,
      "name": "voltorb",
      "weight": 104,
      "height": 5,
      "base_experience": 66,
      "is_default": true,
      "order": 125
    },
    {
      "id": 101,
      "name": "electrode",
      "weight": 666,
      "height": 12,
      "base_experience": 168,
      "is_default": true,
      "order": 126
    },
    {
      "id": 102,
      "name": "exeggcute",
      "weight": 25,
      "height": 4,
      "base_experience": 65,
      "is_default": true,
      "order": 127
    },
    {
      "id": 103,
      "name": "exeggutor",
      "weight": 1200,
      "height": 20,
      "base_experience": 182,
      "is_default": true,
      "order": 128
    },
    {
      "id": 104,
      "name": "cubone",
      "weight": 65,
      "height": 4,
      "base_experience": 64,
      "is_default": true,
      "order": 129
    },
    {
      "id": 105,
      "name": "marowak",
      "weight": 450,
      "height": 10,
      "base_experience": 149,
      "is_default": true,
      "order": 130
    },
    {
      "id": 106,
      "name": "hitmonlee",
      "weight": 498,
      "height": 15,
      "base_experience": 159,
      "is_default": true,
      "order": 132
    },
    {
      "id": 107,
      "name": "hitmonchan",
      "weight": 502,
      "height": 14,
      "base_experience": 159,
      "is_default": true,
      "order": 133
    },
    {
      "id": 108,
      "name": "lickitung",
      "weight": 655,
      "height": 12,
      "base_experience": 77,
      "is_default": true,
      "order": 135
    },
    {
      "id": 109,
      "name": "koffing",
      "weight": 10,
      "height": 6,
      "base_experience": 68,
      "is_default": true,
      "order": 137
    },
    {
      "id": 110,
      "name": "weezing",
      "weight": 95,
      "height": 12,
      "base_experience": 172,
      "is_default": true,
      "order": 138
    },
    {
      "id": 111,
      "name": "rhyhorn",
      "weight": 1150,
      "height": 10,
      "base_experience": 69,
      "is_default": true,
      "order": 139
    },
    {
      "id": 112,
      "name": "rhydon",
      "weight": 1200,
      "height": 19,
      "base_experience": 170,
      "is_default": true,
      "order": 140
    },
    {
      "id": 113,
      "name": "chansey",
      "weight": 346,
      "height": 11,
      "base_experience": 395,
      "is_default": true,
      "order": 143
    },
    {
      "id": 114,
      "name": "tangela",
      "weight": 350,
      "height": 10,
      "base_experience": 87,
      "is_default": true,
      "order": 145
    },
    {
      "id": 115,
      "name": "kangaskhan",
      "weight": 800,
      "height": 22,
      "base_experience": 172,
      "is_default": true,
      "order": 147
    },
    {
      "id": 116,
      "name": "horsea",
      "weight": 80,
      "height": 4,
      "base_experience": 59,
      "is_default": true,
      "order": 149
    },
    {
      "id": 117,
      "name": "seadra",
      "weight": 250,
      "height": 12,
      "base_experience": 154,
      "is_default": true,
      "order": 150
    },
    {
      "id": 118,
      "name": "goldeen",
      "weight": 150,
      "height": 6,
      "base_experience": 64,
      "is_default": true,
      "order": 152
    },
    {
      "id": 119,
      "name": "seaking",
      "weight": 390,
      "height": 13,
      "base_experience": 158,
      "is_default": true,
      "order": 153
    },
    {
      "id": 120,
      "name": "staryu",
      "weight": 345,
      "height": 8,
      "base_experience": 68,
      "is_default": true,
      "order": 154
    },
    {
      "id": 121,
      "name": "starmie",
      "weight": 800,
      "height": 11,
      "base_experience": 182,
      "is_default": true,
      "order": 155
    },
    {
      "id": 122,
      "name": "mr-mime",
      "weight": 545,
      "height": 13,
      "base_experience": 161,
      "is_default": true,
      "order": 157
    },
    {
      "id": 123,
      "name": "scyther",
      "weight": 560,
      "height": 15,
      "base_experience": 100,
      "is_default": true,
      "order": 158
    },
    {
      "id": 124,
      "name": "jynx",
      "weight": 406,
      "height": 14,
      "base_experience": 159,
      "is_default": true,
      "order": 162
    },
    {
      "id": 125,
      "name": "electabuzz",
      "weight": 300,
      "height": 11,
      "base_experience": 172,
      "is_default": true,
      "order": 164
    },
    {
      "id": 126,
      "name": "magmar",
      "weight": 445,
      "height": 13,
      "base_experience": 173,
      "is_default": true,
      "order": 167
    },
    {
      "id": 127,
      "name": "pinsir",
      "weight": 550,
      "height": 15,
      "base_experience": 175,
      "is_default": true,
      "order": 169
    },
    {
      "id": 128,
      "name": "tauros",
      "weight": 884,
      "height": 14,
      "base_experience": 172,
      "is_default": true,
      "order": 171
    },
    {
      "id": 129,
      "name": "magikarp",
      "weight": 100,
      "height": 9,
      "base_experience": 40,
      "is_default": true,
      "order": 172
    },
    {
      "id": 130,
      "name": "gyarados",
      "weight": 2350,
      "height": 65,
      "base_experience": 189,
      "is_default": true,
      "order": 173
    },
    {
      "id": 131,
      "name": "lapras",
      "weight": 2200,
      "height": 25,
      "base_experience": 187,
      "is_default": true,
      "order": 175
    },
    {
      "id": 132,
      "name": "ditto",
      "weight": 40,
      "height": 3,
      "base_experience": 101,
      "is_default": true,
      "order": 176
    },
    {
      "id": 133,
      "name": "eevee",
      "weight": 65,
      "height": 3,
      "base_experience": 65,
      "is_default": true,
      "order": 177
    },
    {
      "id": 134,
      "name": "vaporeon",
      "weight": 290,
      "height": 10,
      "base_experience": 184,
      "is_default": true,
      "order": 178
    },
    {
      "id": 135,
      "name": "jolteon",
      "weight": 245,
      "height": 8,
      "base_experience": 184,
      "is_default": true,
      "order": 179
    },
    {
      "id": 136,
      "name": "flareon",
      "weight": 250,
      "height": 9,
      "base_experience": 184,
      "is_default": true,
      "order": 180
    },
    {
      "id": 137,
      "name": "porygon",
      "weight": 365,
      "height": 8,
      "base_experience": 79,
      "is_default": true,
      "order": 186
    },
    {
      "id": 138,
      "name": "omanyte",
      "weight": 75,
      "height": 4,
      "base_experience": 71,
      "is_default": true,
      "order": 189
    },
    {
      "id": 139,
      "name": "omastar",
      "weight": 350,
      "height": 10,
      "base_experience": 173,
      "is_default": true,
      "order": 190
    },
    {
      "id": 140,
      "name": "kabuto",
      "weight": 115,
      "height": 5,
      "base_experience": 71,
      "is_default": true,
      "order": 191
    },
    {
      "id": 141,
      "name": "kabutops",
      "weight": 405,
      "height": 13,
      "base_experience": 173,
      "is_default": true,
      "order": 192
    },
    {
      "id": 142,
      "name": "aerodactyl",
      "weight": 590,
      "height": 18,
      "base_experience": 180,
      "is_default": true,
      "order": 193
    },
    {
      "id": 143,
      "name": "snorlax",
      "weight": 4600,
      "height": 21,
      "base_experience": 189,
      "is_default": true,
      "order": 196
    },
    {
      "id": 144,
      "name": "articuno",
      "weight": 554,
      "height": 17,
      "base_experience": 261,
      "is_default": true,
      "order": 197
    },
    {
      "id": 145,
      "name": "zapdos",
      "weight": 526,
      "height": 16,
      "base_experience": 261,
      "is_default": true,
      "order": 198
    },
    {
      "id": 146,
      "name": "moltres",
      "weight": 600,
      "height": 20,
      "base_experience": 261,
      "is_default": true,
      "order": 199
    },
    {
      "id": 147,
      "name": "dratini",
      "weight": 33,
      "height": 18,
      "base_experience": 60,
      "is_default": true,
      "order": 200
    },
    {
      "id": 148,
      "name": "dragonair",
      "weight": 165,
      "height": 40,
      "base_experience": 147,
      "is_default": true,
      "order": 201
    },
    {
      "id": 149,
      "name": "dragonite",
      "weight": 2100,
      "height": 22,
      "base_experience": 270,
      "is_default": true,
      "order": 202
    },
    {
      "id": 150,
      "name": "mewtwo",
      "weight": 1220,
      "height": 20,
      "base_experience": 306,
      "is_default": true,
      "order": 203
    },
    {
      "id": 151,
      "name": "mew",
      "weight": 40,
      "height": 4,
      "base_experience": 270,
      "is_default": true,
      "order": 206
    },
    {
      "id": 152,
      "name": "chikorita",
      "weight": 64,
      "height": 9,
      "base_experience": 64,
      "is_default": true,
      "order": 207
    },
    {
      "id": 153,
      "name": "bayleef",
      "weight": 158,
      "height": 12,
      "base_experience": 142,
      "is_default": true,
      "order": 208
    },
    {
      "id": 154,
      "name": "meganium",
      "weight": 1005,
      "height": 18,
      "base_experience": 236,
      "is_default": true,
      "order": 209
    },
    {
      "id": 155,
      "name": "cyndaquil",
      "weight": 79,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 210
    },
    {
      "id": 156,
      "name": "quilava",
      "weight": 190,
      "height": 9,
      "base_experience": 142,
      "is_default": true,
      "order": 211
    },
    {
      "id": 157,
      "name": "typhlosion",
      "weight": 795,
      "height": 17,
      "base_experience": 240,
      "is_default": true,
      "order": 212
    },
    {
      "id": 158,
      "name": "totodile",
      "weight": 95,
      "height": 6,
      "base_experience": 63,
      "is_default": true,
      "order": 213
    },
    {
      "id": 159,
      "name": "croconaw",
      "weight": 250,
      "height": 11,
      "base_experience": 142,
      "is_default": true,
      "order": 214
    },
    {
      "id": 160,
      "name": "feraligatr",
      "weight": 888,
      "height": 23,
      "base_experience": 239,
      "is_default": true,
      "order": 215
    },
    {
      "id": 161,
      "name": "sentret",
      "weight": 60,
      "height": 8,
      "base_experience": 43,
      "is_default": true,
      "order": 216
    },
    {
      "id": 162,
      "name": "furret",
      "weight": 325,
      "height": 18,
      "base_experience": 145,
      "is_default": true,
      "order": 217
    },
    {
      "id": 163,
      "name": "hoothoot",
      "weight": 212,
      "height": 7,
      "base_experience": 52,
      "is_default": true,
      "order": 218
    },
    {
      "id": 164,
      "name": "noctowl",
      "weight": 408,
      "height": 16,
      "base_experience": 155,
      "is_default": true,
      "order": 219
    },
    {
      "id": 165,
      "name": "ledyba",
      "weight": 108,
      "height": 10,
      "base_experience": 53,
      "is_default": true,
      "order": 220
    },
    {
      "id": 166,
      "name": "ledian",
      "weight": 356,
      "height": 14,
      "base_experience": 137,
      "is_default": true,
      "order": 221
    },
    {
      "id": 167,
      "name": "spinarak",
      "weight": 85,
      "height": 5,
      "base_experience": 50,
      "is_default": true,
      "order": 222
    },
    {
      "id": 168,
      "name": "ariados",
      "weight": 335,
      "height": 11,
      "base_experience": 137,
      "is_default": true,
      "order": 223
    },
    {
      "id": 169,
      "name": "crobat",
      "weight": 750,
      "height": 18,
      "base_experience": 241,
      "is_default": true,
      "order": 58
    },
    {
      "id": 170,
      "name": "chinchou",
      "weight": 120,
      "height": 5,
      "base_experience": 66,
      "is_default": true,
      "order": 224
    },
    {
      "id": 171,
      "name": "lanturn",
      "weight": 225,
      "height": 12,
      "base_experience": 161,
      "is_default": true,
      "order": 225
    },
    {
      "id": 172,
      "name": "pichu",
      "weight": 20,
      "height": 3,
      "base_experience": 41,
      "is_default": true,
      "order": 31
    },
    {
      "id": 173,
      "name": "cleffa",
      "weight": 30,
      "height": 3,
      "base_experience": 44,
      "is_default": true,
      "order": 48
    },
    {
      "id": 174,
      "name": "igglybuff",
      "weight": 10,
      "height": 3,
      "base_experience": 42,
      "is_default": true,
      "order": 53
    },
    {
      "id": 175,
      "name": "togepi",
      "weight": 15,
      "height": 3,
      "base_experience": 49,
      "is_default": true,
      "order": 226
    },
    {
      "id": 176,
      "name": "togetic",
      "weight": 32,
      "height": 6,
      "base_experience": 142,
      "is_default": true,
      "order": 227
    },
    {
      "id": 177,
      "name": "natu",
      "weight": 20,
      "height": 2,
      "base_experience": 64,
      "is_default": true,
      "order": 229
    },
    {
      "id": 178,
      "name": "xatu",
      "weight": 150,
      "height": 15,
      "base_experience": 165,
      "is_default": true,
      "order": 230
    },
    {
      "id": 179,
      "name": "mareep",
      "weight": 78,
      "height": 6,
      "base_experience": 56,
      "is_default": true,
      "order": 231
    },
    {
      "id": 180,
      "name": "flaaffy",
      "weight": 133,
      "height": 8,
      "base_experience": 128,
      "is_default": true,
      "order": 232
    },
    {
      "id": 181,
      "name": "ampharos",
      "weight": 615,
      "height": 14,
      "base_experience": 230,
      "is_default": true,
      "order": 233
    },
    {
      "id": 182,
      "name": "bellossom",
      "weight": 58,
      "height": 4,
      "base_experience": 221,
      "is_default": true,
      "order": 62
    },
    {
      "id": 183,
      "name": "marill",
      "weight": 85,
      "height": 4,
      "base_experience": 88,
      "is_default": true,
      "order": 236
    },
    {
      "id": 184,
      "name": "azumarill",
      "weight": 285,
      "height": 8,
      "base_experience": 189,
      "is_default": true,
      "order": 237
    },
    {
      "id": 185,
      "name": "sudowoodo",
      "weight": 380,
      "height": 12,
      "base_experience": 144,
      "is_default": true,
      "order": 239
    },
    {
      "id": 186,
      "name": "politoed",
      "weight": 339,
      "height": 11,
      "base_experience": 225,
      "is_default": true,
      "order": 80
    },
    {
      "id": 187,
      "name": "hoppip",
      "weight": 5,
      "height": 4,
      "base_experience": 50,
      "is_default": true,
      "order": 240
    },
    {
      "id": 188,
      "name": "skiploom",
      "weight": 10,
      "height": 6,
      "base_experience": 119,
      "is_default": true,
      "order": 241
    },
    {
      "id": 189,
      "name": "jumpluff",
      "weight": 30,
      "height": 8,
      "base_experience": 207,
      "is_default": true,
      "order": 242
    },
    {
      "id": 190,
      "name": "aipom",
      "weight": 115,
      "height": 8,
      "base_experience": 72,
      "is_default": true,
      "order": 243
    },
    {
      "id": 191,
      "name": "sunkern",
      "weight": 18,
      "height": 3,
      "base_experience": 36,
      "is_default": true,
      "order": 245
    },
    {
      "id": 192,
      "name": "sunflora",
      "weight": 85,
      "height": 8,
      "base_experience": 149,
      "is_default": true,
      "order": 246
    },
    {
      "id": 193,
      "name": "yanma",
      "weight": 380,
      "height": 12,
      "base_experience": 78,
      "is_default": true,
      "order": 247
    },
    {
      "id": 194,
      "name": "wooper",
      "weight": 85,
      "height": 4,
      "base_experience": 42,
      "is_default": true,
      "order": 249
    },
    {
      "id": 195,
      "name": "quagsire",
      "weight": 750,
      "height": 14,
      "base_experience": 151,
      "is_default": true,
      "order": 250
    },
    {
      "id": 196,
      "name": "espeon",
      "weight": 265,
      "height": 9,
      "base_experience": 184,
      "is_default": true,
      "order": 181
    },
    {
      "id": 197,
      "name": "umbreon",
      "weight": 270,
      "height": 10,
      "base_experience": 184,
      "is_default": true,
      "order": 182
    },
    {
      "id": 198,
      "name": "murkrow",
      "weight": 21,
      "height": 5,
      "base_experience": 81,
      "is_default": true,
      "order": 251
    },
    {
      "id": 199,
      "name": "slowking",
      "weight": 795,
      "height": 20,
      "base_experience": 172,
      "is_default": true,
      "order": 101
    },
    {
      "id": 200,
      "name": "misdreavus",
      "weight": 10,
      "height": 7,
      "base_experience": 87,
      "is_default": true,
      "order": 253
    },
    {
      "id": 201,
      "name": "unown",
      "weight": 50,
      "height": 5,
      "base_experience": 118,
      "is_default": true,
      "order": 255
    },
    {
      "id": 202,
      "name": "wobbuffet",
      "weight": 285,
      "height": 13,
      "base_experience": 142,
      "is_default": true,
      "order": 257
    },
    {
      "id": 203,
      "name": "girafarig",
      "weight": 415,
      "height": 15,
      "base_experience": 159,
      "is_default": true,
      "order": 258
    },
    {
      "id": 204,
      "name": "pineco",
      "weight": 72,
      "height": 6,
      "base_experience": 58,
      "is_default": true,
      "order": 259
    },
    {
      "id": 205,
      "name": "forretress",
      "weight": 1258,
      "height": 12,
      "base_experience": 163,
      "is_default": true,
      "order": 260
    },
    {
      "id": 206,
      "name": "dunsparce",
      "weight": 140,
      "height": 15,
      "base_experience": 145,
      "is_default": true,
      "order": 261
    },
    {
      "id": 207,
      "name": "gligar",
      "weight": 648,
      "height": 11,
      "base_experience": 86,
      "is_default": true,
      "order": 262
    },
    {
      "id": 208,
      "name": "steelix",
      "weight": 4000,
      "height": 92,
      "base_experience": 179,
      "is_default": true,
      "order": 119
    },
    {
      "id": 209,
      "name": "snubbull",
      "weight": 78,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 264
    },
    {
      "id": 210,
      "name": "granbull",
      "weight": 487,
      "height": 14,
      "base_experience": 158,
      "is_default": true,
      "order": 265
    },
    {
      "id": 211,
      "name": "qwilfish",
      "weight": 39,
      "height": 5,
      "base_experience": 86,
      "is_default": true,
      "order": 266
    },
    {
      "id": 212,
      "name": "scizor",
      "weight": 1180,
      "height": 18,
      "base_experience": 175,
      "is_default": true,
      "order": 159
    },
    {
      "id": 213,
      "name": "shuckle",
      "weight": 205,
      "height": 6,
      "base_experience": 177,
      "is_default": true,
      "order": 267
    },
    {
      "id": 214,
      "name": "heracross",
      "weight": 540,
      "height": 15,
      "base_experience": 175,
      "is_default": true,
      "order": 268
    },
    {
      "id": 215,
      "name": "sneasel",
      "weight": 280,
      "height": 9,
      "base_experience": 86,
      "is_default": true,
      "order": 270
    },
    {
      "id": 216,
      "name": "teddiursa",
      "weight": 88,
      "height": 6,
      "base_experience": 66,
      "is_default": true,
      "order": 272
    },
    {
      "id": 217,
      "name": "ursaring",
      "weight": 1258,
      "height": 18,
      "base_experience": 175,
      "is_default": true,
      "order": 273
    },
    {
      "id": 218,
      "name": "slugma",
      "weight": 350,
      "height": 7,
      "base_experience": 50,
      "is_default": true,
      "order": 274
    },
    {
      "id": 219,
      "name": "magcargo",
      "weight": 550,
      "height": 8,
      "base_experience": 144,
      "is_default": true,
      "order": 275
    },
    {
      "id": 220,
      "name": "swinub",
      "weight": 65,
      "height": 4,
      "base_experience": 50,
      "is_default": true,
      "order": 276
    },
    {
      "id": 221,
      "name": "piloswine",
      "weight": 558,
      "height": 11,
      "base_experience": 158,
      "is_default": true,
      "order": 277
    },
    {
      "id": 222,
      "name": "corsola",
      "weight": 50,
      "height": 6,
      "base_experience": 133,
      "is_default": true,
      "order": 279
    },
    {
      "id": 223,
      "name": "remoraid",
      "weight": 120,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 280
    },
    {
      "id": 224,
      "name": "octillery",
      "weight": 285,
      "height": 9,
      "base_experience": 168,
      "is_default": true,
      "order": 281
    },
    {
      "id": 225,
      "name": "delibird",
      "weight": 160,
      "height": 9,
      "base_experience": 116,
      "is_default": true,
      "order": 282
    },
    {
      "id": 226,
      "name": "mantine",
      "weight": 2200,
      "height": 21,
      "base_experience": 163,
      "is_default": true,
      "order": 284
    },
    {
      "id": 227,
      "name": "skarmory",
      "weight": 505,
      "height": 17,
      "base_experience": 163,
      "is_default": true,
      "order": 285
    },
    {
      "id": 228,
      "name": "houndour",
      "weight": 108,
      "height": 6,
      "base_experience": 66,
      "is_default": true,
      "order": 286
    },
    {
      "id": 229,
      "name": "houndoom",
      "weight": 350,
      "height": 14,
      "base_experience": 175,
      "is_default": true,
      "order": 287
    },
    {
      "id": 230,
      "name": "kingdra",
      "weight": 1520,
      "height": 18,
      "base_experience": 243,
      "is_default": true,
      "order": 151
    },
    {
      "id": 231,
      "name": "phanpy",
      "weight": 335,
      "height": 5,
      "base_experience": 66,
      "is_default": true,
      "order": 289
    },
    {
      "id": 232,
      "name": "donphan",
      "weight": 1200,
      "height": 11,
      "base_experience": 175,
      "is_default": true,
      "order": 290
    },
    {
      "id": 233,
      "name": "porygon2",
      "weight": 325,
      "height": 6,
      "base_experience": 180,
      "is_default": true,
      "order": 187
    },
    {
      "id": 234,
      "name": "stantler",
      "weight": 712,
      "height": 14,
      "base_experience": 163,
      "is_default": true,
      "order": 291
    },
    {
      "id": 235,
      "name": "smeargle",
      "weight": 580,
      "height": 12,
      "base_experience": 88,
      "is_default": true,
      "order": 292
    },
    {
      "id": 236,
      "name": "tyrogue",
      "weight": 210,
      "height": 7,
      "base_experience": 42,
      "is_default": true,
      "order": 131
    },
    {
      "id": 237,
      "name": "hitmontop",
      "weight": 480,
      "height": 14,
      "base_experience": 159,
      "is_default": true,
      "order": 134
    },
    {
      "id": 238,
      "name": "smoochum",
      "weight": 60,
      "height": 4,
      "base_experience": 61,
      "is_default": true,
      "order": 161
    },
    {
      "id": 239,
      "name": "elekid",
      "weight": 235,
      "height": 6,
      "base_experience": 72,
      "is_default": true,
      "order": 163
    },
    {
      "id": 240,
      "name": "magby",
      "weight": 214,
      "height": 7,
      "base_experience": 73,
      "is_default": true,
      "order": 166
    },
    {
      "id": 241,
      "name": "miltank",
      "weight": 755,
      "height": 12,
      "base_experience": 172,
      "is_default": true,
      "order": 293
    },
    {
      "id": 242,
      "name": "blissey",
      "weight": 468,
      "height": 15,
      "base_experience": 608,
      "is_default": true,
      "order": 144
    },
    {
      "id": 243,
      "name": "raikou",
      "weight": 1780,
      "height": 19,
      "base_experience": 261,
      "is_default": true,
      "order": 294
    },
    {
      "id": 244,
      "name": "entei",
      "weight": 1980,
      "height": 21,
      "base_experience": 261,
      "is_default": true,
      "order": 295
    },
    {
      "id": 245,
      "name": "suicune",
      "weight": 1870,
      "height": 20,
      "base_experience": 261,
      "is_default": true,
      "order": 296
    },
    {
      "id": 246,
      "name": "larvitar",
      "weight": 720,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 297
    },
    {
      "id": 247,
      "name": "pupitar",
      "weight": 1520,
      "height": 12,
      "base_experience": 144,
      "is_default": true,
      "order": 298
    },
    {
      "id": 248,
      "name": "tyranitar",
      "weight": 2020,
      "height": 20,
      "base_experience": 270,
      "is_default": true,
      "order": 299
    },
    {
      "id": 249,
      "name": "lugia",
      "weight": 2160,
      "height": 52,
      "base_experience": 306,
      "is_default": true,
      "order": 301
    },
    {
      "id": 250,
      "name": "ho-oh",
      "weight": 1990,
      "height": 38,
      "base_experience": 306,
      "is_default": true,
      "order": 302
    },
    {
      "id": 251,
      "name": "celebi",
      "weight": 50,
      "height": 6,
      "base_experience": 270,
      "is_default": true,
      "order": 303
    },
    {
      "id": 252,
      "name": "treecko",
      "weight": 50,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 304
    },
    {
      "id": 253,
      "name": "grovyle",
      "weight": 216,
      "height": 9,
      "base_experience": 142,
      "is_default": true,
      "order": 305
    },
    {
      "id": 254,
      "name": "sceptile",
      "weight": 522,
      "height": 17,
      "base_experience": 239,
      "is_default": true,
      "order": 306
    },
    {
      "id": 255,
      "name": "torchic",
      "weight": 25,
      "height": 4,
      "base_experience": 62,
      "is_default": true,
      "order": 308
    },
    {
      "id": 256,
      "name": "combusken",
      "weight": 195,
      "height": 9,
      "base_experience": 142,
      "is_default": true,
      "order": 309
    },
    {
      "id": 257,
      "name": "blaziken",
      "weight": 520,
      "height": 19,
      "base_experience": 239,
      "is_default": true,
      "order": 310
    },
    {
      "id": 258,
      "name": "mudkip",
      "weight": 76,
      "height": 4,
      "base_experience": 62,
      "is_default": true,
      "order": 312
    },
    {
      "id": 259,
      "name": "marshtomp",
      "weight": 280,
      "height": 7,
      "base_experience": 142,
      "is_default": true,
      "order": 313
    },
    {
      "id": 260,
      "name": "swampert",
      "weight": 819,
      "height": 15,
      "base_experience": 241,
      "is_default": true,
      "order": 314
    },
    {
      "id": 261,
      "name": "poochyena",
      "weight": 136,
      "height": 5,
      "base_experience": 44,
      "is_default": true,
      "order": 316
    },
    {
      "id": 262,
      "name": "mightyena",
      "weight": 370,
      "height": 10,
      "base_experience": 147,
      "is_default": true,
      "order": 317
    },
    {
      "id": 263,
      "name": "zigzagoon",
      "weight": 175,
      "height": 4,
      "base_experience": 48,
      "is_default": true,
      "order": 318
    },
    {
      "id": 264,
      "name": "linoone",
      "weight": 325,
      "height": 5,
      "base_experience": 147,
      "is_default": true,
      "order": 319
    },
    {
      "id": 265,
      "name": "wurmple",
      "weight": 36,
      "height": 3,
      "base_experience": 39,
      "is_default": true,
      "order": 320
    },
    {
      "id": 266,
      "name": "silcoon",
      "weight": 100,
      "height": 6,
      "base_experience": 72,
      "is_default": true,
      "order": 321
    },
    {
      "id": 267,
      "name": "beautifly",
      "weight": 284,
      "height": 10,
      "base_experience": 178,
      "is_default": true,
      "order": 322
    },
    {
      "id": 268,
      "name": "cascoon",
      "weight": 115,
      "height": 7,
      "base_experience": 41,
      "is_default": true,
      "order": 323
    },
    {
      "id": 269,
      "name": "dustox",
      "weight": 316,
      "height": 12,
      "base_experience": 135,
      "is_default": true,
      "order": 324
    },
    {
      "id": 270,
      "name": "lotad",
      "weight": 26,
      "height": 5,
      "base_experience": 44,
      "is_default": true,
      "order": 325
    },
    {
      "id": 271,
      "name": "lombre",
      "weight": 325,
      "height": 12,
      "base_experience": 119,
      "is_default": true,
      "order": 326
    },
    {
      "id": 272,
      "name": "ludicolo",
      "weight": 550,
      "height": 15,
      "base_experience": 216,
      "is_default": true,
      "order": 327
    },
    {
      "id": 273,
      "name": "seedot",
      "weight": 40,
      "height": 5,
      "base_experience": 44,
      "is_default": true,
      "order": 328
    },
    {
      "id": 274,
      "name": "nuzleaf",
      "weight": 280,
      "height": 10,
      "base_experience": 119,
      "is_default": true,
      "order": 329
    },
    {
      "id": 275,
      "name": "shiftry",
      "weight": 596,
      "height": 13,
      "base_experience": 216,
      "is_default": true,
      "order": 330
    },
    {
      "id": 276,
      "name": "taillow",
      "weight": 23,
      "height": 3,
      "base_experience": 54,
      "is_default": true,
      "order": 331
    },
    {
      "id": 277,
      "name": "swellow",
      "weight": 198,
      "height": 7,
      "base_experience": 151,
      "is_default": true,
      "order": 332
    },
    {
      "id": 278,
      "name": "wingull",
      "weight": 95,
      "height": 6,
      "base_experience": 54,
      "is_default": true,
      "order": 333
    },
    {
      "id": 279,
      "name": "pelipper",
      "weight": 280,
      "height": 12,
      "base_experience": 151,
      "is_default": true,
      "order": 334
    },
    {
      "id": 280,
      "name": "ralts",
      "weight": 66,
      "height": 4,
      "base_experience": 40,
      "is_default": true,
      "order": 335
    },
    {
      "id": 281,
      "name": "kirlia",
      "weight": 202,
      "height": 8,
      "base_experience": 97,
      "is_default": true,
      "order": 336
    },
    {
      "id": 282,
      "name": "gardevoir",
      "weight": 484,
      "height": 16,
      "base_experience": 233,
      "is_default": true,
      "order": 337
    },
    {
      "id": 283,
      "name": "surskit",
      "weight": 17,
      "height": 5,
      "base_experience": 54,
      "is_default": true,
      "order": 341
    },
    {
      "id": 284,
      "name": "masquerain",
      "weight": 36,
      "height": 8,
      "base_experience": 145,
      "is_default": true,
      "order": 342
    },
    {
      "id": 285,
      "name": "shroomish",
      "weight": 45,
      "height": 4,
      "base_experience": 59,
      "is_default": true,
      "order": 343
    },
    {
      "id": 286,
      "name": "breloom",
      "weight": 392,
      "height": 12,
      "base_experience": 161,
      "is_default": true,
      "order": 344
    },
    {
      "id": 287,
      "name": "slakoth",
      "weight": 240,
      "height": 8,
      "base_experience": 56,
      "is_default": true,
      "order": 345
    },
    {
      "id": 288,
      "name": "vigoroth",
      "weight": 465,
      "height": 14,
      "base_experience": 154,
      "is_default": true,
      "order": 346
    },
    {
      "id": 289,
      "name": "slaking",
      "weight": 1305,
      "height": 20,
      "base_experience": 252,
      "is_default": true,
      "order": 347
    },
    {
      "id": 290,
      "name": "nincada",
      "weight": 55,
      "height": 5,
      "base_experience": 53,
      "is_default": true,
      "order": 348
    },
    {
      "id": 291,
      "name": "ninjask",
      "weight": 120,
      "height": 8,
      "base_experience": 160,
      "is_default": true,
      "order": 349
    },
    {
      "id": 292,
      "name": "shedinja",
      "weight": 12,
      "height": 8,
      "base_experience": 83,
      "is_default": true,
      "order": 350
    },
    {
      "id": 293,
      "name": "whismur",
      "weight": 163,
      "height": 6,
      "base_experience": 48,
      "is_default": true,
      "order": 351
    },
    {
      "id": 294,
      "name": "loudred",
      "weight": 405,
      "height": 10,
      "base_experience": 126,
      "is_default": true,
      "order": 352
    },
    {
      "id": 295,
      "name": "exploud",
      "weight": 840,
      "height": 15,
      "base_experience": 221,
      "is_default": true,
      "order": 353
    },
    {
      "id": 296,
      "name": "makuhita",
      "weight": 864,
      "height": 10,
      "base_experience": 47,
      "is_default": true,
      "order": 354
    },
    {
      "id": 297,
      "name": "hariyama",
      "weight": 2538,
      "height": 23,
      "base_experience": 166,
      "is_default": true,
      "order": 355
    },
    {
      "id": 298,
      "name": "azurill",
      "weight": 20,
      "height": 2,
      "base_experience": 38,
      "is_default": true,
      "order": 235
    },
    {
      "id": 299,
      "name": "nosepass",
      "weight": 970,
      "height": 10,
      "base_experience": 75,
      "is_default": true,
      "order": 356
    },
    {
      "id": 300,
      "name": "skitty",
      "weight": 110,
      "height": 6,
      "base_experience": 52,
      "is_default": true,
      "order": 358
    },
    {
      "id": 301,
      "name": "delcatty",
      "weight": 326,
      "height": 11,
      "base_experience": 133,
      "is_default": true,
      "order": 359
    },
    {
      "id": 302,
      "name": "sableye",
      "weight": 110,
      "height": 5,
      "base_experience": 133,
      "is_default": true,
      "order": 360
    },
    {
      "id": 303,
      "name": "mawile",
      "weight": 115,
      "height": 6,
      "base_experience": 133,
      "is_default": true,
      "order": 362
    },
    {
      "id": 304,
      "name": "aron",
      "weight": 600,
      "height": 4,
      "base_experience": 66,
      "is_default": true,
      "order": 364
    },
    {
      "id": 305,
      "name": "lairon",
      "weight": 1200,
      "height": 9,
      "base_experience": 151,
      "is_default": true,
      "order": 365
    },
    {
      "id": 306,
      "name": "aggron",
      "weight": 3600,
      "height": 21,
      "base_experience": 239,
      "is_default": true,
      "order": 366
    },
    {
      "id": 307,
      "name": "meditite",
      "weight": 112,
      "height": 6,
      "base_experience": 56,
      "is_default": true,
      "order": 368
    },
    {
      "id": 308,
      "name": "medicham",
      "weight": 315,
      "height": 13,
      "base_experience": 144,
      "is_default": true,
      "order": 369
    },
    {
      "id": 309,
      "name": "electrike",
      "weight": 152,
      "height": 6,
      "base_experience": 59,
      "is_default": true,
      "order": 371
    },
    {
      "id": 310,
      "name": "manectric",
      "weight": 402,
      "height": 15,
      "base_experience": 166,
      "is_default": true,
      "order": 372
    },
    {
      "id": 311,
      "name": "plusle",
      "weight": 42,
      "height": 4,
      "base_experience": 142,
      "is_default": true,
      "order": 374
    },
    {
      "id": 312,
      "name": "minun",
      "weight": 42,
      "height": 4,
      "base_experience": 142,
      "is_default": true,
      "order": 375
    },
    {
      "id": 313,
      "name": "volbeat",
      "weight": 177,
      "height": 7,
      "base_experience": 140,
      "is_default": true,
      "order": 376
    },
    {
      "id": 314,
      "name": "illumise",
      "weight": 177,
      "height": 6,
      "base_experience": 140,
      "is_default": true,
      "order": 377
    },
    {
      "id": 315,
      "name": "roselia",
      "weight": 20,
      "height": 3,
      "base_experience": 140,
      "is_default": true,
      "order": 379
    },
    {
      "id": 316,
      "name": "gulpin",
      "weight": 103,
      "height": 4,
      "base_experience": 60,
      "is_default": true,
      "order": 381
    },
    {
      "id": 317,
      "name": "swalot",
      "weight": 800,
      "height": 17,
      "base_experience": 163,
      "is_default": true,
      "order": 382
    },
    {
      "id": 318,
      "name": "carvanha",
      "weight": 208,
      "height": 8,
      "base_experience": 61,
      "is_default": true,
      "order": 383
    },
    {
      "id": 319,
      "name": "sharpedo",
      "weight": 888,
      "height": 18,
      "base_experience": 161,
      "is_default": true,
      "order": 384
    },
    {
      "id": 320,
      "name": "wailmer",
      "weight": 1300,
      "height": 20,
      "base_experience": 80,
      "is_default": true,
      "order": 386
    },
    {
      "id": 321,
      "name": "wailord",
      "weight": 3980,
      "height": 145,
      "base_experience": 175,
      "is_default": true,
      "order": 387
    },
    {
      "id": 322,
      "name": "numel",
      "weight": 240,
      "height": 7,
      "base_experience": 61,
      "is_default": true,
      "order": 388
    },
    {
      "id": 323,
      "name": "camerupt",
      "weight": 2200,
      "height": 19,
      "base_experience": 161,
      "is_default": true,
      "order": 389
    },
    {
      "id": 324,
      "name": "torkoal",
      "weight": 804,
      "height": 5,
      "base_experience": 165,
      "is_default": true,
      "order": 391
    },
    {
      "id": 325,
      "name": "spoink",
      "weight": 306,
      "height": 7,
      "base_experience": 66,
      "is_default": true,
      "order": 392
    },
    {
      "id": 326,
      "name": "grumpig",
      "weight": 715,
      "height": 9,
      "base_experience": 165,
      "is_default": true,
      "order": 393
    },
    {
      "id": 327,
      "name": "spinda",
      "weight": 50,
      "height": 11,
      "base_experience": 126,
      "is_default": true,
      "order": 394
    },
    {
      "id": 328,
      "name": "trapinch",
      "weight": 150,
      "height": 7,
      "base_experience": 58,
      "is_default": true,
      "order": 395
    },
    {
      "id": 329,
      "name": "vibrava",
      "weight": 153,
      "height": 11,
      "base_experience": 119,
      "is_default": true,
      "order": 396
    },
    {
      "id": 330,
      "name": "flygon",
      "weight": 820,
      "height": 20,
      "base_experience": 234,
      "is_default": true,
      "order": 397
    },
    {
      "id": 331,
      "name": "cacnea",
      "weight": 513,
      "height": 4,
      "base_experience": 67,
      "is_default": true,
      "order": 398
    },
    {
      "id": 332,
      "name": "cacturne",
      "weight": 774,
      "height": 13,
      "base_experience": 166,
      "is_default": true,
      "order": 399
    },
    {
      "id": 333,
      "name": "swablu",
      "weight": 12,
      "height": 4,
      "base_experience": 62,
      "is_default": true,
      "order": 400
    },
    {
      "id": 334,
      "name": "altaria",
      "weight": 206,
      "height": 11,
      "base_experience": 172,
      "is_default": true,
      "order": 401
    },
    {
      "id": 335,
      "name": "zangoose",
      "weight": 403,
      "height": 13,
      "base_experience": 160,
      "is_default": true,
      "order": 403
    },
    {
      "id": 336,
      "name": "seviper",
      "weight": 525,
      "height": 27,
      "base_experience": 160,
      "is_default": true,
      "order": 404
    },
    {
      "id": 337,
      "name": "lunatone",
      "weight": 1680,
      "height": 10,
      "base_experience": 154,
      "is_default": true,
      "order": 405
    },
    {
      "id": 338,
      "name": "solrock",
      "weight": 1540,
      "height": 12,
      "base_experience": 154,
      "is_default": true,
      "order": 406
    },
    {
      "id": 339,
      "name": "barboach",
      "weight": 19,
      "height": 4,
      "base_experience": 58,
      "is_default": true,
      "order": 407
    },
    {
      "id": 340,
      "name": "whiscash",
      "weight": 236,
      "height": 9,
      "base_experience": 164,
      "is_default": true,
      "order": 408
    },
    {
      "id": 341,
      "name": "corphish",
      "weight": 115,
      "height": 6,
      "base_experience": 62,
      "is_default": true,
      "order": 409
    },
    {
      "id": 342,
      "name": "crawdaunt",
      "weight": 328,
      "height": 11,
      "base_experience": 164,
      "is_default": true,
      "order": 410
    },
    {
      "id": 343,
      "name": "baltoy",
      "weight": 215,
      "height": 5,
      "base_experience": 60,
      "is_default": true,
      "order": 411
    },
    {
      "id": 344,
      "name": "claydol",
      "weight": 1080,
      "height": 15,
      "base_experience": 175,
      "is_default": true,
      "order": 412
    },
    {
      "id": 345,
      "name": "lileep",
      "weight": 238,
      "height": 10,
      "base_experience": 71,
      "is_default": true,
      "order": 413
    },
    {
      "id": 346,
      "name": "cradily",
      "weight": 604,
      "height": 15,
      "base_experience": 173,
      "is_default": true,
      "order": 414
    },
    {
      "id": 347,
      "name": "anorith",
      "weight": 125,
      "height": 7,
      "base_experience": 71,
      "is_default": true,
      "order": 415
    },
    {
      "id": 348,
      "name": "armaldo",
      "weight": 682,
      "height": 15,
      "base_experience": 173,
      "is_default": true,
      "order": 416
    },
    {
      "id": 349,
      "name": "feebas",
      "weight": 74,
      "height": 6,
      "base_experience": 40,
      "is_default": true,
      "order": 417
    },
    {
      "id": 350,
      "name": "milotic",
      "weight": 1620,
      "height": 62,
      "base_experience": 189,
      "is_default": true,
      "order": 418
    },
    {
      "id": 351,
      "name": "castform",
      "weight": 8,
      "height": 3,
      "base_experience": 147,
      "is_default": true,
      "order": 419
    },
    {
      "id": 352,
      "name": "kecleon",
      "weight": 220,
      "height": 10,
      "base_experience": 154,
      "is_default": true,
      "order": 423
    },
    {
      "id": 353,
      "name": "shuppet",
      "weight": 23,
      "height": 6,
      "base_experience": 59,
      "is_default": true,
      "order": 424
    },
    {
      "id": 354,
      "name": "banette",
      "weight": 125,
      "height": 11,
      "base_experience": 159,
      "is_default": true,
      "order": 425
    },
    {
      "id": 355,
      "name": "duskull",
      "weight": 150,
      "height": 8,
      "base_experience": 59,
      "is_default": true,
      "order": 427
    },
    {
      "id": 356,
      "name": "dusclops",
      "weight": 306,
      "height": 16,
      "base_experience": 159,
      "is_default": true,
      "order": 428
    },
    {
      "id": 357,
      "name": "tropius",
      "weight": 1000,
      "height": 20,
      "base_experience": 161,
      "is_default": true,
      "order": 430
    },
    {
      "id": 358,
      "name": "chimecho",
      "weight": 10,
      "height": 6,
      "base_experience": 149,
      "is_default": true,
      "order": 432
    },
    {
      "id": 359,
      "name": "absol",
      "weight": 470,
      "height": 12,
      "base_experience": 163,
      "is_default": true,
      "order": 433
    },
    {
      "id": 360,
      "name": "wynaut",
      "weight": 140,
      "height": 6,
      "base_experience": 52,
      "is_default": true,
      "order": 256
    },
    {
      "id": 361,
      "name": "snorunt",
      "weight": 168,
      "height": 7,
      "base_experience": 60,
      "is_default": true,
      "order": 435
    },
    {
      "id": 362,
      "name": "glalie",
      "weight": 2565,
      "height": 15,
      "base_experience": 168,
      "is_default": true,
      "order": 436
    },
    {
      "id": 363,
      "name": "spheal",
      "weight": 395,
      "height": 8,
      "base_experience": 58,
      "is_default": true,
      "order": 439
    },
    {
      "id": 364,
      "name": "sealeo",
      "weight": 876,
      "height": 11,
      "base_experience": 144,
      "is_default": true,
      "order": 440
    },
    {
      "id": 365,
      "name": "walrein",
      "weight": 1506,
      "height": 14,
      "base_experience": 239,
      "is_default": true,
      "order": 441
    },
    {
      "id": 366,
      "name": "clamperl",
      "weight": 525,
      "height": 4,
      "base_experience": 69,
      "is_default": true,
      "order": 442
    },
    {
      "id": 367,
      "name": "huntail",
      "weight": 270,
      "height": 17,
      "base_experience": 170,
      "is_default": true,
      "order": 443
    },
    {
      "id": 368,
      "name": "gorebyss",
      "weight": 226,
      "height": 18,
      "base_experience": 170,
      "is_default": true,
      "order": 444
    },
    {
      "id": 369,
      "name": "relicanth",
      "weight": 234,
      "height": 10,
      "base_experience": 170,
      "is_default": true,
      "order": 445
    },
    {
      "id": 370,
      "name": "luvdisc",
      "weight": 87,
      "height": 6,
      "base_experience": 116,
      "is_default": true,
      "order": 446
    },
    {
      "id": 371,
      "name": "bagon",
      "weight": 421,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 447
    },
    {
      "id": 372,
      "name": "shelgon",
      "weight": 1105,
      "height": 11,
      "base_experience": 147,
      "is_default": true,
      "order": 448
    },
    {
      "id": 373,
      "name": "salamence",
      "weight": 1026,
      "height": 15,
      "base_experience": 270,
      "is_default": true,
      "order": 449
    },
    {
      "id": 374,
      "name": "beldum",
      "weight": 952,
      "height": 6,
      "base_experience": 60,
      "is_default": true,
      "order": 451
    },
    {
      "id": 375,
      "name": "metang",
      "weight": 2025,
      "height": 12,
      "base_experience": 147,
      "is_default": true,
      "order": 452
    },
    {
      "id": 376,
      "name": "metagross",
      "weight": 5500,
      "height": 16,
      "base_experience": 270,
      "is_default": true,
      "order": 453
    },
    {
      "id": 377,
      "name": "regirock",
      "weight": 2300,
      "height": 17,
      "base_experience": 261,
      "is_default": true,
      "order": 455
    },
    {
      "id": 378,
      "name": "regice",
      "weight": 1750,
      "height": 18,
      "base_experience": 261,
      "is_default": true,
      "order": 456
    },
    {
      "id": 379,
      "name": "registeel",
      "weight": 2050,
      "height": 19,
      "base_experience": 261,
      "is_default": true,
      "order": 457
    },
    {
      "id": 380,
      "name": "latias",
      "weight": 400,
      "height": 14,
      "base_experience": 270,
      "is_default": true,
      "order": 458
    },
    {
      "id": 381,
      "name": "latios",
      "weight": 600,
      "height": 20,
      "base_experience": 270,
      "is_default": true,
      "order": 460
    },
    {
      "id": 382,
      "name": "kyogre",
      "weight": 3520,
      "height": 45,
      "base_experience": 302,
      "is_default": true,
      "order": 462
    },
    {
      "id": 383,
      "name": "groudon",
      "weight": 9500,
      "height": 35,
      "base_experience": 302,
      "is_default": true,
      "order": 464
    },
    {
      "id": 384,
      "name": "rayquaza",
      "weight": 2065,
      "height": 70,
      "base_experience": 306,
      "is_default": true,
      "order": 466
    },
    {
      "id": 385,
      "name": "jirachi",
      "weight": 11,
      "height": 3,
      "base_experience": 270,
      "is_default": true,
      "order": 468
    },
    {
      "id": 386,
      "name": "deoxys-normal",
      "weight": 608,
      "height": 17,
      "base_experience": 270,
      "is_default": true,
      "order": 469
    },
    {
      "id": 387,
      "name": "turtwig",
      "weight": 102,
      "height": 4,
      "base_experience": 64,
      "is_default": true,
      "order": 473
    },
    {
      "id": 388,
      "name": "grotle",
      "weight": 970,
      "height": 11,
      "base_experience": 142,
      "is_default": true,
      "order": 474
    },
    {
      "id": 389,
      "name": "torterra",
      "weight": 3100,
      "height": 22,
      "base_experience": 236,
      "is_default": true,
      "order": 475
    },
    {
      "id": 390,
      "name": "chimchar",
      "weight": 62,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 476
    },
    {
      "id": 391,
      "name": "monferno",
      "weight": 220,
      "height": 9,
      "base_experience": 142,
      "is_default": true,
      "order": 477
    },
    {
      "id": 392,
      "name": "infernape",
      "weight": 550,
      "height": 12,
      "base_experience": 240,
      "is_default": true,
      "order": 478
    },
    {
      "id": 393,
      "name": "piplup",
      "weight": 52,
      "height": 4,
      "base_experience": 63,
      "is_default": true,
      "order": 479
    },
    {
      "id": 394,
      "name": "prinplup",
      "weight": 230,
      "height": 8,
      "base_experience": 142,
      "is_default": true,
      "order": 480
    },
    {
      "id": 395,
      "name": "empoleon",
      "weight": 845,
      "height": 17,
      "base_experience": 239,
      "is_default": true,
      "order": 481
    },
    {
      "id": 396,
      "name": "starly",
      "weight": 20,
      "height": 3,
      "base_experience": 49,
      "is_default": true,
      "order": 482
    },
    {
      "id": 397,
      "name": "staravia",
      "weight": 155,
      "height": 6,
      "base_experience": 119,
      "is_default": true,
      "order": 483
    },
    {
      "id": 398,
      "name": "staraptor",
      "weight": 249,
      "height": 12,
      "base_experience": 218,
      "is_default": true,
      "order": 484
    },
    {
      "id": 399,
      "name": "bidoof",
      "weight": 200,
      "height": 5,
      "base_experience": 50,
      "is_default": true,
      "order": 485
    },
    {
      "id": 400,
      "name": "bibarel",
      "weight": 315,
      "height": 10,
      "base_experience": 144,
      "is_default": true,
      "order": 486
    },
    {
      "id": 401,
      "name": "kricketot",
      "weight": 22,
      "height": 3,
      "base_experience": 39,
      "is_default": true,
      "order": 487
    },
    {
      "id": 402,
      "name": "kricketune",
      "weight": 255,
      "height": 10,
      "base_experience": 134,
      "is_default": true,
      "order": 488
    },
    {
      "id": 403,
      "name": "shinx",
      "weight": 95,
      "height": 5,
      "base_experience": 53,
      "is_default": true,
      "order": 489
    },
    {
      "id": 404,
      "name": "luxio",
      "weight": 305,
      "height": 9,
      "base_experience": 127,
      "is_default": true,
      "order": 490
    },
    {
      "id": 405,
      "name": "luxray",
      "weight": 420,
      "height": 14,
      "base_experience": 235,
      "is_default": true,
      "order": 491
    },
    {
      "id": 406,
      "name": "budew",
      "weight": 12,
      "height": 2,
      "base_experience": 56,
      "is_default": true,
      "order": 378
    },
    {
      "id": 407,
      "name": "roserade",
      "weight": 145,
      "height": 9,
      "base_experience": 232,
      "is_default": true,
      "order": 380
    },
    {
      "id": 408,
      "name": "cranidos",
      "weight": 315,
      "height": 9,
      "base_experience": 70,
      "is_default": true,
      "order": 492
    },
    {
      "id": 409,
      "name": "rampardos",
      "weight": 1025,
      "height": 16,
      "base_experience": 173,
      "is_default": true,
      "order": 493
    },
    {
      "id": 410,
      "name": "shieldon",
      "weight": 570,
      "height": 5,
      "base_experience": 70,
      "is_default": true,
      "order": 494
    },
    {
      "id": 411,
      "name": "bastiodon",
      "weight": 1495,
      "height": 13,
      "base_experience": 173,
      "is_default": true,
      "order": 495
    },
    {
      "id": 412,
      "name": "burmy",
      "weight": 34,
      "height": 2,
      "base_experience": 45,
      "is_default": true,
      "order": 496
    },
    {
      "id": 413,
      "name": "wormadam-plant",
      "weight": 65,
      "height": 5,
      "base_experience": 148,
      "is_default": true,
      "order": 497
    },
    {
      "id": 414,
      "name": "mothim",
      "weight": 233,
      "height": 9,
      "base_experience": 148,
      "is_default": true,
      "order": 500
    },
    {
      "id": 415,
      "name": "combee",
      "weight": 55,
      "height": 3,
      "base_experience": 49,
      "is_default": true,
      "order": 501
    },
    {
      "id": 416,
      "name": "vespiquen",
      "weight": 385,
      "height": 12,
      "base_experience": 166,
      "is_default": true,
      "order": 502
    },
    {
      "id": 417,
      "name": "pachirisu",
      "weight": 39,
      "height": 4,
      "base_experience": 142,
      "is_default": true,
      "order": 503
    },
    {
      "id": 418,
      "name": "buizel",
      "weight": 295,
      "height": 7,
      "base_experience": 66,
      "is_default": true,
      "order": 504
    },
    {
      "id": 419,
      "name": "floatzel",
      "weight": 335,
      "height": 11,
      "base_experience": 173,
      "is_default": true,
      "order": 505
    },
    {
      "id": 420,
      "name": "cherubi",
      "weight": 33,
      "height": 4,
      "base_experience": 55,
      "is_default": true,
      "order": 506
    },
    {
      "id": 421,
      "name": "cherrim",
      "weight": 93,
      "height": 5,
      "base_experience": 158,
      "is_default": true,
      "order": 507
    },
    {
      "id": 422,
      "name": "shellos",
      "weight": 63,
      "height": 3,
      "base_experience": 65,
      "is_default": true,
      "order": 508
    },
    {
      "id": 423,
      "name": "gastrodon",
      "weight": 299,
      "height": 9,
      "base_experience": 166,
      "is_default": true,
      "order": 509
    },
    {
      "id": 424,
      "name": "ambipom",
      "weight": 203,
      "height": 12,
      "base_experience": 169,
      "is_default": true,
      "order": 244
    },
    {
      "id": 425,
      "name": "drifloon",
      "weight": 12,
      "height": 4,
      "base_experience": 70,
      "is_default": true,
      "order": 510
    },
    {
      "id": 426,
      "name": "drifblim",
      "weight": 150,
      "height": 12,
      "base_experience": 174,
      "is_default": true,
      "order": 511
    },
    {
      "id": 427,
      "name": "buneary",
      "weight": 55,
      "height": 4,
      "base_experience": 70,
      "is_default": true,
      "order": 512
    },
    {
      "id": 428,
      "name": "lopunny",
      "weight": 333,
      "height": 12,
      "base_experience": 168,
      "is_default": true,
      "order": 513
    },
    {
      "id": 429,
      "name": "mismagius",
      "weight": 44,
      "height": 9,
      "base_experience": 173,
      "is_default": true,
      "order": 254
    },
    {
      "id": 430,
      "name": "honchkrow",
      "weight": 273,
      "height": 9,
      "base_experience": 177,
      "is_default": true,
      "order": 252
    },
    {
      "id": 431,
      "name": "glameow",
      "weight": 39,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 515
    },
    {
      "id": 432,
      "name": "purugly",
      "weight": 438,
      "height": 10,
      "base_experience": 158,
      "is_default": true,
      "order": 516
    },
    {
      "id": 433,
      "name": "chingling",
      "weight": 6,
      "height": 2,
      "base_experience": 57,
      "is_default": true,
      "order": 431
    },
    {
      "id": 434,
      "name": "stunky",
      "weight": 192,
      "height": 4,
      "base_experience": 66,
      "is_default": true,
      "order": 517
    },
    {
      "id": 435,
      "name": "skuntank",
      "weight": 380,
      "height": 10,
      "base_experience": 168,
      "is_default": true,
      "order": 518
    },
    {
      "id": 436,
      "name": "bronzor",
      "weight": 605,
      "height": 5,
      "base_experience": 60,
      "is_default": true,
      "order": 519
    },
    {
      "id": 437,
      "name": "bronzong",
      "weight": 1870,
      "height": 13,
      "base_experience": 175,
      "is_default": true,
      "order": 520
    },
    {
      "id": 438,
      "name": "bonsly",
      "weight": 150,
      "height": 5,
      "base_experience": 58,
      "is_default": true,
      "order": 238
    },
    {
      "id": 439,
      "name": "mime-jr",
      "weight": 130,
      "height": 6,
      "base_experience": 62,
      "is_default": true,
      "order": 156
    },
    {
      "id": 440,
      "name": "happiny",
      "weight": 244,
      "height": 6,
      "base_experience": 110,
      "is_default": true,
      "order": 142
    },
    {
      "id": 441,
      "name": "chatot",
      "weight": 19,
      "height": 5,
      "base_experience": 144,
      "is_default": true,
      "order": 521
    },
    {
      "id": 442,
      "name": "spiritomb",
      "weight": 1080,
      "height": 10,
      "base_experience": 170,
      "is_default": true,
      "order": 522
    },
    {
      "id": 443,
      "name": "gible",
      "weight": 205,
      "height": 7,
      "base_experience": 60,
      "is_default": true,
      "order": 523
    },
    {
      "id": 444,
      "name": "gabite",
      "weight": 560,
      "height": 14,
      "base_experience": 144,
      "is_default": true,
      "order": 524
    },
    {
      "id": 445,
      "name": "garchomp",
      "weight": 950,
      "height": 19,
      "base_experience": 270,
      "is_default": true,
      "order": 525
    },
    {
      "id": 446,
      "name": "munchlax",
      "weight": 1050,
      "height": 6,
      "base_experience": 78,
      "is_default": true,
      "order": 195
    },
    {
      "id": 447,
      "name": "riolu",
      "weight": 202,
      "height": 7,
      "base_experience": 57,
      "is_default": true,
      "order": 527
    },
    {
      "id": 448,
      "name": "lucario",
      "weight": 540,
      "height": 12,
      "base_experience": 184,
      "is_default": true,
      "order": 528
    },
    {
      "id": 449,
      "name": "hippopotas",
      "weight": 495,
      "height": 8,
      "base_experience": 66,
      "is_default": true,
      "order": 530
    },
    {
      "id": 450,
      "name": "hippowdon",
      "weight": 3000,
      "height": 20,
      "base_experience": 184,
      "is_default": true,
      "order": 531
    },
    {
      "id": 451,
      "name": "skorupi",
      "weight": 120,
      "height": 8,
      "base_experience": 66,
      "is_default": true,
      "order": 532
    },
    {
      "id": 452,
      "name": "drapion",
      "weight": 615,
      "height": 13,
      "base_experience": 175,
      "is_default": true,
      "order": 533
    },
    {
      "id": 453,
      "name": "croagunk",
      "weight": 230,
      "height": 7,
      "base_experience": 60,
      "is_default": true,
      "order": 534
    },
    {
      "id": 454,
      "name": "toxicroak",
      "weight": 444,
      "height": 13,
      "base_experience": 172,
      "is_default": true,
      "order": 535
    },
    {
      "id": 455,
      "name": "carnivine",
      "weight": 270,
      "height": 14,
      "base_experience": 159,
      "is_default": true,
      "order": 536
    },
    {
      "id": 456,
      "name": "finneon",
      "weight": 70,
      "height": 4,
      "base_experience": 66,
      "is_default": true,
      "order": 537
    },
    {
      "id": 457,
      "name": "lumineon",
      "weight": 240,
      "height": 12,
      "base_experience": 161,
      "is_default": true,
      "order": 538
    },
    {
      "id": 458,
      "name": "mantyke",
      "weight": 650,
      "height": 10,
      "base_experience": 69,
      "is_default": true,
      "order": 283
    },
    {
      "id": 459,
      "name": "snover",
      "weight": 505,
      "height": 10,
      "base_experience": 67,
      "is_default": true,
      "order": 539
    },
    {
      "id": 460,
      "name": "abomasnow",
      "weight": 1355,
      "height": 22,
      "base_experience": 173,
      "is_default": true,
      "order": 540
    },
    {
      "id": 461,
      "name": "weavile",
      "weight": 340,
      "height": 11,
      "base_experience": 179,
      "is_default": true,
      "order": 271
    },
    {
      "id": 462,
      "name": "magnezone",
      "weight": 1800,
      "height": 12,
      "base_experience": 241,
      "is_default": true,
      "order": 104
    },
    {
      "id": 463,
      "name": "lickilicky",
      "weight": 1400,
      "height": 17,
      "base_experience": 180,
      "is_default": true,
      "order": 136
    },
    {
      "id": 464,
      "name": "rhyperior",
      "weight": 2828,
      "height": 24,
      "base_experience": 241,
      "is_default": true,
      "order": 141
    },
    {
      "id": 465,
      "name": "tangrowth",
      "weight": 1286,
      "height": 20,
      "base_experience": 187,
      "is_default": true,
      "order": 146
    },
    {
      "id": 466,
      "name": "electivire",
      "weight": 1386,
      "height": 18,
      "base_experience": 243,
      "is_default": true,
      "order": 165
    },
    {
      "id": 467,
      "name": "magmortar",
      "weight": 680,
      "height": 16,
      "base_experience": 243,
      "is_default": true,
      "order": 168
    },
    {
      "id": 468,
      "name": "togekiss",
      "weight": 380,
      "height": 15,
      "base_experience": 245,
      "is_default": true,
      "order": 228
    },
    {
      "id": 469,
      "name": "yanmega",
      "weight": 515,
      "height": 19,
      "base_experience": 180,
      "is_default": true,
      "order": 248
    },
    {
      "id": 470,
      "name": "leafeon",
      "weight": 255,
      "height": 10,
      "base_experience": 184,
      "is_default": true,
      "order": 183
    },
    {
      "id": 471,
      "name": "glaceon",
      "weight": 259,
      "height": 8,
      "base_experience": 184,
      "is_default": true,
      "order": 184
    },
    {
      "id": 472,
      "name": "gliscor",
      "weight": 425,
      "height": 20,
      "base_experience": 179,
      "is_default": true,
      "order": 263
    },
    {
      "id": 473,
      "name": "mamoswine",
      "weight": 2910,
      "height": 25,
      "base_experience": 239,
      "is_default": true,
      "order": 278
    },
    {
      "id": 474,
      "name": "porygon-z",
      "weight": 340,
      "height": 9,
      "base_experience": 241,
      "is_default": true,
      "order": 188
    },
    {
      "id": 475,
      "name": "gallade",
      "weight": 520,
      "height": 16,
      "base_experience": 233,
      "is_default": true,
      "order": 339
    },
    {
      "id": 476,
      "name": "probopass",
      "weight": 3400,
      "height": 14,
      "base_experience": 184,
      "is_default": true,
      "order": 357
    },
    {
      "id": 477,
      "name": "dusknoir",
      "weight": 1066,
      "height": 22,
      "base_experience": 236,
      "is_default": true,
      "order": 429
    },
    {
      "id": 478,
      "name": "froslass",
      "weight": 266,
      "height": 13,
      "base_experience": 168,
      "is_default": true,
      "order": 438
    },
    {
      "id": 479,
      "name": "rotom",
      "weight": 3,
      "height": 3,
      "base_experience": 154,
      "is_default": true,
      "order": 542
    },
    {
      "id": 480,
      "name": "uxie",
      "weight": 3,
      "height": 3,
      "base_experience": 261,
      "is_default": true,
      "order": 548
    },
    {
      "id": 481,
      "name": "mesprit",
      "weight": 3,
      "height": 3,
      "base_experience": 261,
      "is_default": true,
      "order": 549
    },
    {
      "id": 482,
      "name": "azelf",
      "weight": 3,
      "height": 3,
      "base_experience": 261,
      "is_default": true,
      "order": 550
    },
    {
      "id": 483,
      "name": "dialga",
      "weight": 6830,
      "height": 54,
      "base_experience": 306,
      "is_default": true,
      "order": 551
    },
    {
      "id": 484,
      "name": "palkia",
      "weight": 3360,
      "height": 42,
      "base_experience": 306,
      "is_default": true,
      "order": 552
    },
    {
      "id": 485,
      "name": "heatran",
      "weight": 4300,
      "height": 17,
      "base_experience": 270,
      "is_default": true,
      "order": 553
    },
    {
      "id": 486,
      "name": "regigigas",
      "weight": 4200,
      "height": 37,
      "base_experience": 302,
      "is_default": true,
      "order": 554
    },
    {
      "id": 487,
      "name": "giratina-altered",
      "weight": 7500,
      "height": 45,
      "base_experience": 306,
      "is_default": true,
      "order": 555
    },
    {
      "id": 488,
      "name": "cresselia",
      "weight": 856,
      "height": 15,
      "base_experience": 270,
      "is_default": true,
      "order": 557
    },
    {
      "id": 489,
      "name": "phione",
      "weight": 31,
      "height": 4,
      "base_experience": 216,
      "is_default": true,
      "order": 558
    },
    {
      "id": 490,
      "name": "manaphy",
      "weight": 14,
      "height": 3,
      "base_experience": 270,
      "is_default": true,
      "order": 559
    },
    {
      "id": 491,
      "name": "darkrai",
      "weight": 505,
      "height": 15,
      "base_experience": 270,
      "is_default": true,
      "order": 560
    },
    {
      "id": 492,
      "name": "shaymin-land",
      "weight": 21,
      "height": 2,
      "base_experience": 270,
      "is_default": true,
      "order": 561
    },
    {
      "id": 493,
      "name": "arceus",
      "weight": 3200,
      "height": 32,
      "base_experience": 324,
      "is_default": true,
      "order": 563
    },
    {
      "id": 494,
      "name": "victini",
      "weight": 40,
      "height": 4,
      "base_experience": 270,
      "is_default": true,
      "order": 564
    },
    {
      "id": 495,
      "name": "snivy",
      "weight": 81,
      "height": 6,
      "base_experience": 62,
      "is_default": true,
      "order": 565
    },
    {
      "id": 496,
      "name": "servine",
      "weight": 160,
      "height": 8,
      "base_experience": 145,
      "is_default": true,
      "order": 566
    },
    {
      "id": 497,
      "name": "serperior",
      "weight": 630,
      "height": 33,
      "base_experience": 238,
      "is_default": true,
      "order": 567
    },
    {
      "id": 498,
      "name": "tepig",
      "weight": 99,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 568
    },
    {
      "id": 499,
      "name": "pignite",
      "weight": 555,
      "height": 10,
      "base_experience": 146,
      "is_default": true,
      "order": 569
    },
    {
      "id": 500,
      "name": "emboar",
      "weight": 1500,
      "height": 16,
      "base_experience": 238,
      "is_default": true,
      "order": 570
    },
    {
      "id": 501,
      "name": "oshawott",
      "weight": 59,
      "height": 5,
      "base_experience": 62,
      "is_default": true,
      "order": 571
    },
    {
      "id": 502,
      "name": "dewott",
      "weight": 245,
      "height": 8,
      "base_experience": 145,
      "is_default": true,
      "order": 572
    },
    {
      "id": 503,
      "name": "samurott",
      "weight": 946,
      "height": 15,
      "base_experience": 238,
      "is_default": true,
      "order": 573
    },
    {
      "id": 504,
      "name": "patrat",
      "weight": 116,
      "height": 5,
      "base_experience": 51,
      "is_default": true,
      "order": 574
    },
    {
      "id": 505,
      "name": "watchog",
      "weight": 270,
      "height": 11,
      "base_experience": 147,
      "is_default": true,
      "order": 575
    },
    {
      "id": 506,
      "name": "lillipup",
      "weight": 41,
      "height": 4,
      "base_experience": 55,
      "is_default": true,
      "order": 576
    },
    {
      "id": 507,
      "name": "herdier",
      "weight": 147,
      "height": 9,
      "base_experience": 130,
      "is_default": true,
      "order": 577
    },
    {
      "id": 508,
      "name": "stoutland",
      "weight": 610,
      "height": 12,
      "base_experience": 225,
      "is_default": true,
      "order": 578
    },
    {
      "id": 509,
      "name": "purrloin",
      "weight": 101,
      "height": 4,
      "base_experience": 56,
      "is_default": true,
      "order": 579
    },
    {
      "id": 510,
      "name": "liepard",
      "weight": 375,
      "height": 11,
      "base_experience": 156,
      "is_default": true,
      "order": 580
    },
    {
      "id": 511,
      "name": "pansage",
      "weight": 105,
      "height": 6,
      "base_experience": 63,
      "is_default": true,
      "order": 581
    },
    {
      "id": 512,
      "name": "simisage",
      "weight": 305,
      "height": 11,
      "base_experience": 174,
      "is_default": true,
      "order": 582
    },
    {
      "id": 513,
      "name": "pansear",
      "weight": 110,
      "height": 6,
      "base_experience": 63,
      "is_default": true,
      "order": 583
    },
    {
      "id": 514,
      "name": "simisear",
      "weight": 280,
      "height": 10,
      "base_experience": 174,
      "is_default": true,
      "order": 584
    },
    {
      "id": 515,
      "name": "panpour",
      "weight": 135,
      "height": 6,
      "base_experience": 63,
      "is_default": true,
      "order": 585
    },
    {
      "id": 516,
      "name": "simipour",
      "weight": 290,
      "height": 10,
      "base_experience": 174,
      "is_default": true,
      "order": 586
    },
    {
      "id": 517,
      "name": "munna",
      "weight": 233,
      "height": 6,
      "base_experience": 58,
      "is_default": true,
      "order": 587
    },
    {
      "id": 518,
      "name": "musharna",
      "weight": 605,
      "height": 11,
      "base_experience": 170,
      "is_default": true,
      "order": 588
    },
    {
      "id": 519,
      "name": "pidove",
      "weight": 21,
      "height": 3,
      "base_experience": 53,
      "is_default": true,
      "order": 589
    },
    {
      "id": 520,
      "name": "tranquill",
      "weight": 150,
      "height": 6,
      "base_experience": 125,
      "is_default": true,
      "order": 590
    },
    {
      "id": 521,
      "name": "unfezant",
      "weight": 290,
      "height": 12,
      "base_experience": 220,
      "is_default": true,
      "order": 591
    },
    {
      "id": 522,
      "name": "blitzle",
      "weight": 298,
      "height": 8,
      "base_experience": 59,
      "is_default": true,
      "order": 592
    },
    {
      "id": 523,
      "name": "zebstrika",
      "weight": 795,
      "height": 16,
      "base_experience": 174,
      "is_default": true,
      "order": 593
    },
    {
      "id": 524,
      "name": "roggenrola",
      "weight": 180,
      "height": 4,
      "base_experience": 56,
      "is_default": true,
      "order": 594
    },
    {
      "id": 525,
      "name": "boldore",
      "weight": 1020,
      "height": 9,
      "base_experience": 137,
      "is_default": true,
      "order": 595
    },
    {
      "id": 526,
      "name": "gigalith",
      "weight": 2600,
      "height": 17,
      "base_experience": 232,
      "is_default": true,
      "order": 596
    },
    {
      "id": 527,
      "name": "woobat",
      "weight": 21,
      "height": 4,
      "base_experience": 63,
      "is_default": true,
      "order": 597
    },
    {
      "id": 528,
      "name": "swoobat",
      "weight": 105,
      "height": 9,
      "base_experience": 149,
      "is_default": true,
      "order": 598
    },
    {
      "id": 529,
      "name": "drilbur",
      "weight": 85,
      "height": 3,
      "base_experience": 66,
      "is_default": true,
      "order": 599
    },
    {
      "id": 530,
      "name": "excadrill",
      "weight": 404,
      "height": 7,
      "base_experience": 178,
      "is_default": true,
      "order": 600
    },
    {
      "id": 531,
      "name": "audino",
      "weight": 310,
      "height": 11,
      "base_experience": 390,
      "is_default": true,
      "order": 601
    },
    {
      "id": 532,
      "name": "timburr",
      "weight": 125,
      "height": 6,
      "base_experience": 61,
      "is_default": true,
      "order": 603
    },
    {
      "id": 533,
      "name": "gurdurr",
      "weight": 400,
      "height": 12,
      "base_experience": 142,
      "is_default": true,
      "order": 604
    },
    {
      "id": 534,
      "name": "conkeldurr",
      "weight": 870,
      "height": 14,
      "base_experience": 227,
      "is_default": true,
      "order": 605
    },
    {
      "id": 535,
      "name": "tympole",
      "weight": 45,
      "height": 5,
      "base_experience": 59,
      "is_default": true,
      "order": 606
    },
    {
      "id": 536,
      "name": "palpitoad",
      "weight": 170,
      "height": 8,
      "base_experience": 134,
      "is_default": true,
      "order": 607
    },
    {
      "id": 537,
      "name": "seismitoad",
      "weight": 620,
      "height": 15,
      "base_experience": 229,
      "is_default": true,
      "order": 608
    },
    {
      "id": 538,
      "name": "throh",
      "weight": 555,
      "height": 13,
      "base_experience": 163,
      "is_default": true,
      "order": 609
    },
    {
      "id": 539,
      "name": "sawk",
      "weight": 510,
      "height": 14,
      "base_experience": 163,
      "is_default": true,
      "order": 610
    },
    {
      "id": 540,
      "name": "sewaddle",
      "weight": 25,
      "height": 3,
      "base_experience": 62,
      "is_default": true,
      "order": 611
    },
    {
      "id": 541,
      "name": "swadloon",
      "weight": 73,
      "height": 5,
      "base_experience": 133,
      "is_default": true,
      "order": 612
    },
    {
      "id": 542,
      "name": "leavanny",
      "weight": 205,
      "height": 12,
      "base_experience": 225,
      "is_default": true,
      "order": 613
    },
    {
      "id": 543,
      "name": "venipede",
      "weight": 53,
      "height": 4,
      "base_experience": 52,
      "is_default": true,
      "order": 614
    },
    {
      "id": 544,
      "name": "whirlipede",
      "weight": 585,
      "height": 12,
      "base_experience": 126,
      "is_default": true,
      "order": 615
    },
    {
      "id": 545,
      "name": "scolipede",
      "weight": 2005,
      "height": 25,
      "base_experience": 218,
      "is_default": true,
      "order": 616
    },
    {
      "id": 546,
      "name": "cottonee",
      "weight": 6,
      "height": 3,
      "base_experience": 56,
      "is_default": true,
      "order": 617
    },
    {
      "id": 547,
      "name": "whimsicott",
      "weight": 66,
      "height": 7,
      "base_experience": 168,
      "is_default": true,
      "order": 618
    },
    {
      "id": 548,
      "name": "petilil",
      "weight": 66,
      "height": 5,
      "base_experience": 56,
      "is_default": true,
      "order": 619
    },
    {
      "id": 549,
      "name": "lilligant",
      "weight": 163,
      "height": 11,
      "base_experience": 168,
      "is_default": true,
      "order": 620
    },
    {
      "id": 550,
      "name": "basculin-red-striped",
      "weight": 180,
      "height": 10,
      "base_experience": 161,
      "is_default": true,
      "order": 621
    },
    {
      "id": 551,
      "name": "sandile",
      "weight": 152,
      "height": 7,
      "base_experience": 58,
      "is_default": true,
      "order": 623
    },
    {
      "id": 552,
      "name": "krokorok",
      "weight": 334,
      "height": 10,
      "base_experience": 123,
      "is_default": true,
      "order": 624
    },
    {
      "id": 553,
      "name": "krookodile",
      "weight": 963,
      "height": 15,
      "base_experience": 234,
      "is_default": true,
      "order": 625
    },
    {
      "id": 554,
      "name": "darumaka",
      "weight": 375,
      "height": 6,
      "base_experience": 63,
      "is_default": true,
      "order": 626
    },
    {
      "id": 555,
      "name": "darmanitan-standard",
      "weight": 929,
      "height": 13,
      "base_experience": 168,
      "is_default": true,
      "order": 627
    },
    {
      "id": 556,
      "name": "maractus",
      "weight": 280,
      "height": 10,
      "base_experience": 161,
      "is_default": true,
      "order": 629
    },
    {
      "id": 557,
      "name": "dwebble",
      "weight": 145,
      "height": 3,
      "base_experience": 65,
      "is_default": true,
      "order": 630
    },
    {
      "id": 558,
      "name": "crustle",
      "weight": 2000,
      "height": 14,
      "base_experience": 166,
      "is_default": true,
      "order": 631
    },
    {
      "id": 559,
      "name": "scraggy",
      "weight": 118,
      "height": 6,
      "base_experience": 70,
      "is_default": true,
      "order": 632
    },
    {
      "id": 560,
      "name": "scrafty",
      "weight": 300,
      "height": 11,
      "base_experience": 171,
      "is_default": true,
      "order": 633
    },
    {
      "id": 561,
      "name": "sigilyph",
      "weight": 140,
      "height": 14,
      "base_experience": 172,
      "is_default": true,
      "order": 634
    },
    {
      "id": 562,
      "name": "yamask",
      "weight": 15,
      "height": 5,
      "base_experience": 61,
      "is_default": true,
      "order": 635
    },
    {
      "id": 563,
      "name": "cofagrigus",
      "weight": 765,
      "height": 17,
      "base_experience": 169,
      "is_default": true,
      "order": 636
    },
    {
      "id": 564,
      "name": "tirtouga",
      "weight": 165,
      "height": 7,
      "base_experience": 71,
      "is_default": true,
      "order": 637
    },
    {
      "id": 565,
      "name": "carracosta",
      "weight": 810,
      "height": 12,
      "base_experience": 173,
      "is_default": true,
      "order": 638
    },
    {
      "id": 566,
      "name": "archen",
      "weight": 95,
      "height": 5,
      "base_experience": 71,
      "is_default": true,
      "order": 639
    },
    {
      "id": 567,
      "name": "archeops",
      "weight": 320,
      "height": 14,
      "base_experience": 177,
      "is_default": true,
      "order": 640
    },
    {
      "id": 568,
      "name": "trubbish",
      "weight": 310,
      "height": 6,
      "base_experience": 66,
      "is_default": true,
      "order": 641
    },
    {
      "id": 569,
      "name": "garbodor",
      "weight": 1073,
      "height": 19,
      "base_experience": 166,
      "is_default": true,
      "order": 642
    },
    {
      "id": 570,
      "name": "zorua",
      "weight": 125,
      "height": 7,
      "base_experience": 66,
      "is_default": true,
      "order": 643
    },
    {
      "id": 571,
      "name": "zoroark",
      "weight": 811,
      "height": 16,
      "base_experience": 179,
      "is_default": true,
      "order": 644
    },
    {
      "id": 572,
      "name": "minccino",
      "weight": 58,
      "height": 4,
      "base_experience": 60,
      "is_default": true,
      "order": 645
    },
    {
      "id": 573,
      "name": "cinccino",
      "weight": 75,
      "height": 5,
      "base_experience": 165,
      "is_default": true,
      "order": 646
    },
    {
      "id": 574,
      "name": "gothita",
      "weight": 58,
      "height": 4,
      "base_experience": 58,
      "is_default": true,
      "order": 647
    },
    {
      "id": 575,
      "name": "gothorita",
      "weight": 180,
      "height": 7,
      "base_experience": 137,
      "is_default": true,
      "order": 648
    },
    {
      "id": 576,
      "name": "gothitelle",
      "weight": 440,
      "height": 15,
      "base_experience": 221,
      "is_default": true,
      "order": 649
    },
    {
      "id": 577,
      "name": "solosis",
      "weight": 10,
      "height": 3,
      "base_experience": 58,
      "is_default": true,
      "order": 650
    },
    {
      "id": 578,
      "name": "duosion",
      "weight": 80,
      "height": 6,
      "base_experience": 130,
      "is_default": true,
      "order": 651
    },
    {
      "id": 579,
      "name": "reuniclus",
      "weight": 201,
      "height": 10,
      "base_experience": 221,
      "is_default": true,
      "order": 652
    },
    {
      "id": 580,
      "name": "ducklett",
      "weight": 55,
      "height": 5,
      "base_experience": 61,
      "is_default": true,
      "order": 653
    },
    {
      "id": 581,
      "name": "swanna",
      "weight": 242,
      "height": 13,
      "base_experience": 166,
      "is_default": true,
      "order": 654
    },
    {
      "id": 582,
      "name": "vanillite",
      "weight": 57,
      "height": 4,
      "base_experience": 61,
      "is_default": true,
      "order": 655
    },
    {
      "id": 583,
      "name": "vanillish",
      "weight": 410,
      "height": 11,
      "base_experience": 138,
      "is_default": true,
      "order": 656
    },
    {
      "id": 584,
      "name": "vanilluxe",
      "weight": 575,
      "height": 13,
      "base_experience": 241,
      "is_default": true,
      "order": 657
    },
    {
      "id": 585,
      "name": "deerling",
      "weight": 195,
      "height": 6,
      "base_experience": 67,
      "is_default": true,
      "order": 658
    },
    {
      "id": 586,
      "name": "sawsbuck",
      "weight": 925,
      "height": 19,
      "base_experience": 166,
      "is_default": true,
      "order": 659
    },
    {
      "id": 587,
      "name": "emolga",
      "weight": 50,
      "height": 4,
      "base_experience": 150,
      "is_default": true,
      "order": 660
    },
    {
      "id": 588,
      "name": "karrablast",
      "weight": 59,
      "height": 5,
      "base_experience": 63,
      "is_default": true,
      "order": 661
    },
    {
      "id": 589,
      "name": "escavalier",
      "weight": 330,
      "height": 10,
      "base_experience": 173,
      "is_default": true,
      "order": 662
    },
    {
      "id": 590,
      "name": "foongus",
      "weight": 10,
      "height": 2,
      "base_experience": 59,
      "is_default": true,
      "order": 663
    },
    {
      "id": 591,
      "name": "amoonguss",
      "weight": 105,
      "height": 6,
      "base_experience": 162,
      "is_default": true,
      "order": 664
    },
    {
      "id": 592,
      "name": "frillish",
      "weight": 330,
      "height": 12,
      "base_experience": 67,
      "is_default": true,
      "order": 665
    },
    {
      "id": 593,
      "name": "jellicent",
      "weight": 1350,
      "height": 22,
      "base_experience": 168,
      "is_default": true,
      "order": 666
    },
    {
      "id": 594,
      "name": "alomomola",
      "weight": 316,
      "height": 12,
      "base_experience": 165,
      "is_default": true,
      "order": 667
    },
    {
      "id": 595,
      "name": "joltik",
      "weight": 6,
      "height": 1,
      "base_experience": 64,
      "is_default": true,
      "order": 668
    },
    {
      "id": 596,
      "name": "galvantula",
      "weight": 143,
      "height": 8,
      "base_experience": 165,
      "is_default": true,
      "order": 669
    },
    {
      "id": 597,
      "name": "ferroseed",
      "weight": 188,
      "height": 6,
      "base_experience": 61,
      "is_default": true,
      "order": 670
    },
    {
      "id": 598,
      "name": "ferrothorn",
      "weight": 1100,
      "height": 10,
      "base_experience": 171,
      "is_default": true,
      "order": 671
    },
    {
      "id": 599,
      "name": "klink",
      "weight": 210,
      "height": 3,
      "base_experience": 60,
      "is_default": true,
      "order": 672
    },
    {
      "id": 600,
      "name": "klang",
      "weight": 510,
      "height": 6,
      "base_experience": 154,
      "is_default": true,
      "order": 673
    },
    {
      "id": 601,
      "name": "klinklang",
      "weight": 810,
      "height": 6,
      "base_experience": 234,
      "is_default": true,
      "order": 674
    },
    {
      "id": 602,
      "name": "tynamo",
      "weight": 3,
      "height": 2,
      "base_experience": 55,
      "is_default": true,
      "order": 675
    },
    {
      "id": 603,
      "name": "eelektrik",
      "weight": 220,
      "height": 12,
      "base_experience": 142,
      "is_default": true,
      "order": 676
    },
    {
      "id": 604,
      "name": "eelektross",
      "weight": 805,
      "height": 21,
      "base_experience": 232,
      "is_default": true,
      "order": 677
    },
    {
      "id": 605,
      "name": "elgyem",
      "weight": 90,
      "height": 5,
      "base_experience": 67,
      "is_default": true,
      "order": 678
    },
    {
      "id": 606,
      "name": "beheeyem",
      "weight": 345,
      "height": 10,
      "base_experience": 170,
      "is_default": true,
      "order": 679
    },
    {
      "id": 607,
      "name": "litwick",
      "weight": 31,
      "height": 3,
      "base_experience": 55,
      "is_default": true,
      "order": 680
    },
    {
      "id": 608,
      "name": "lampent",
      "weight": 130,
      "height": 6,
      "base_experience": 130,
      "is_default": true,
      "order": 681
    },
    {
      "id": 609,
      "name": "chandelure",
      "weight": 343,
      "height": 10,
      "base_experience": 234,
      "is_default": true,
      "order": 682
    },
    {
      "id": 610,
      "name": "axew",
      "weight": 180,
      "height": 6,
      "base_experience": 64,
      "is_default": true,
      "order": 683
    },
    {
      "id": 611,
      "name": "fraxure",
      "weight": 360,
      "height": 10,
      "base_experience": 144,
      "is_default": true,
      "order": 684
    },
    {
      "id": 612,
      "name": "haxorus",
      "weight": 1055,
      "height": 18,
      "base_experience": 243,
      "is_default": true,
      "order": 685
    },
    {
      "id": 613,
      "name": "cubchoo",
      "weight": 85,
      "height": 5,
      "base_experience": 61,
      "is_default": true,
      "order": 686
    },
    {
      "id": 614,
      "name": "beartic",
      "weight": 2600,
      "height": 26,
      "base_experience": 170,
      "is_default": true,
      "order": 687
    },
    {
      "id": 615,
      "name": "cryogonal",
      "weight": 1480,
      "height": 11,
      "base_experience": 170,
      "is_default": true,
      "order": 688
    },
    {
      "id": 616,
      "name": "shelmet",
      "weight": 77,
      "height": 4,
      "base_experience": 61,
      "is_default": true,
      "order": 689
    },
    {
      "id": 617,
      "name": "accelgor",
      "weight": 253,
      "height": 8,
      "base_experience": 173,
      "is_default": true,
      "order": 690
    },
    {
      "id": 618,
      "name": "stunfisk",
      "weight": 110,
      "height": 7,
      "base_experience": 165,
      "is_default": true,
      "order": 691
    },
    {
      "id": 619,
      "name": "mienfoo",
      "weight": 200,
      "height": 9,
      "base_experience": 70,
      "is_default": true,
      "order": 692
    },
    {
      "id": 620,
      "name": "mienshao",
      "weight": 355,
      "height": 14,
      "base_experience": 179,
      "is_default": true,
      "order": 693
    },
    {
      "id": 621,
      "name": "druddigon",
      "weight": 1390,
      "height": 16,
      "base_experience": 170,
      "is_default": true,
      "order": 694
    },
    {
      "id": 622,
      "name": "golett",
      "weight": 920,
      "height": 10,
      "base_experience": 61,
      "is_default": true,
      "order": 695
    },
    {
      "id": 623,
      "name": "golurk",
      "weight": 3300,
      "height": 28,
      "base_experience": 169,
      "is_default": true,
      "order": 696
    },
    {
      "id": 624,
      "name": "pawniard",
      "weight": 102,
      "height": 5,
      "base_experience": 68,
      "is_default": true,
      "order": 697
    },
    {
      "id": 625,
      "name": "bisharp",
      "weight": 700,
      "height": 16,
      "base_experience": 172,
      "is_default": true,
      "order": 698
    },
    {
      "id": 626,
      "name": "bouffalant",
      "weight": 946,
      "height": 16,
      "base_experience": 172,
      "is_default": true,
      "order": 699
    },
    {
      "id": 627,
      "name": "rufflet",
      "weight": 105,
      "height": 5,
      "base_experience": 70,
      "is_default": true,
      "order": 700
    },
    {
      "id": 628,
      "name": "braviary",
      "weight": 410,
      "height": 15,
      "base_experience": 179,
      "is_default": true,
      "order": 701
    },
    {
      "id": 629,
      "name": "vullaby",
      "weight": 90,
      "height": 5,
      "base_experience": 74,
      "is_default": true,
      "order": 702
    },
    {
      "id": 630,
      "name": "mandibuzz",
      "weight": 395,
      "height": 12,
      "base_experience": 179,
      "is_default": true,
      "order": 703
    },
    {
      "id": 631,
      "name": "heatmor",
      "weight": 580,
      "height": 14,
      "base_experience": 169,
      "is_default": true,
      "order": 704
    },
    {
      "id": 632,
      "name": "durant",
      "weight": 330,
      "height": 3,
      "base_experience": 169,
      "is_default": true,
      "order": 705
    },
    {
      "id": 633,
      "name": "deino",
      "weight": 173,
      "height": 8,
      "base_experience": 60,
      "is_default": true,
      "order": 706
    },
    {
      "id": 634,
      "name": "zweilous",
      "weight": 500,
      "height": 14,
      "base_experience": 147,
      "is_default": true,
      "order": 707
    },
    {
      "id": 635,
      "name": "hydreigon",
      "weight": 1600,
      "height": 18,
      "base_experience": 270,
      "is_default": true,
      "order": 708
    },
    {
      "id": 636,
      "name": "larvesta",
      "weight": 288,
      "height": 11,
      "base_experience": 72,
      "is_default": true,
      "order": 709
    },
    {
      "id": 637,
      "name": "volcarona",
      "weight": 460,
      "height": 16,
      "base_experience": 248,
      "is_default": true,
      "order": 710
    },
    {
      "id": 638,
      "name": "cobalion",
      "weight": 2500,
      "height": 21,
      "base_experience": 261,
      "is_default": true,
      "order": 711
    },
    {
      "id": 639,
      "name": "terrakion",
      "weight": 2600,
      "height": 19,
      "base_experience": 261,
      "is_default": true,
      "order": 712
    },
    {
      "id": 640,
      "name": "virizion",
      "weight": 2000,
      "height": 20,
      "base_experience": 261,
      "is_default": true,
      "order": 713
    },
    {
      "id": 641,
      "name": "tornadus-incarnate",
      "weight": 630,
      "height": 15,
      "base_experience": 261,
      "is_default": true,
      "order": 714
    },
    {
      "id": 642,
      "name": "thundurus-incarnate",
      "weight": 610,
      "height": 15,
      "base_experience": 261,
      "is_default": true,
      "order": 716
    },
    {
      "id": 643,
      "name": "reshiram",
      "weight": 3300,
      "height": 32,
      "base_experience": 306,
      "is_default": true,
      "order": 718
    },
    {
      "id": 644,
      "name": "zekrom",
      "weight": 3450,
      "height": 29,
      "base_experience": 306,
      "is_default": true,
      "order": 719
    },
    {
      "id": 645,
      "name": "landorus-incarnate",
      "weight": 680,
      "height": 15,
      "base_experience": 270,
      "is_default": true,
      "order": 720
    },
    {
      "id": 646,
      "name": "kyurem",
      "weight": 3250,
      "height": 30,
      "base_experience": 297,
      "is_default": true,
      "order": 722
    },
    {
      "id": 647,
      "name": "keldeo-ordinary",
      "weight": 485,
      "height": 14,
      "base_experience": 261,
      "is_default": true,
      "order": 725
    },
    {
      "id": 648,
      "name": "meloetta-aria",
      "weight": 65,
      "height": 6,
      "base_experience": 270,
      "is_default": true,
      "order": 727
    },
    {
      "id": 649,
      "name": "genesect",
      "weight": 825,
      "height": 15,
      "base_experience": 270,
      "is_default": true,
      "order": 729
    },
    {
      "id": 650,
      "name": "chespin",
      "weight": 90,
      "height": 4,
      "base_experience": 63,
      "is_default": true,
      "order": 730
    },
    {
      "id": 651,
      "name": "quilladin",
      "weight": 290,
      "height": 7,
      "base_experience": 142,
      "is_default": true,
      "order": 731
    },
    {
      "id": 652,
      "name": "chesnaught",
      "weight": 900,
      "height": 16,
      "base_experience": 239,
      "is_default": true,
      "order": 732
    },
    {
      "id": 653,
      "name": "fennekin",
      "weight": 94,
      "height": 4,
      "base_experience": 61,
      "is_default": true,
      "order": 733
    },
    {
      "id": 654,
      "name": "braixen",
      "weight": 145,
      "height": 10,
      "base_experience": 143,
      "is_default": true,
      "order": 734
    },
    {
      "id": 655,
      "name": "delphox",
      "weight": 390,
      "height": 15,
      "base_experience": 240,
      "is_default": true,
      "order": 735
    },
    {
      "id": 656,
      "name": "froakie",
      "weight": 70,
      "height": 3,
      "base_experience": 63,
      "is_default": true,
      "order": 736
    },
    {
      "id": 657,
      "name": "frogadier",
      "weight": 109,
      "height": 6,
      "base_experience": 142,
      "is_default": true,
      "order": 737
    },
    {
      "id": 658,
      "name": "greninja",
      "weight": 400,
      "height": 15,
      "base_experience": 239,
      "is_default": true,
      "order": 738
    },
    {
      "id": 659,
      "name": "bunnelby",
      "weight": 50,
      "height": 4,
      "base_experience": 47,
      "is_default": true,
      "order": 739
    },
    {
      "id": 660,
      "name": "diggersby",
      "weight": 424,
      "height": 10,
      "base_experience": 148,
      "is_default": true,
      "order": 740
    },
    {
      "id": 661,
      "name": "fletchling",
      "weight": 17,
      "height": 3,
      "base_experience": 56,
      "is_default": true,
      "order": 741
    },
    {
      "id": 662,
      "name": "fletchinder",
      "weight": 160,
      "height": 7,
      "base_experience": 134,
      "is_default": true,
      "order": 742
    },
    {
      "id": 663,
      "name": "talonflame",
      "weight": 245,
      "height": 12,
      "base_experience": 175,
      "is_default": true,
      "order": 743
    },
    {
      "id": 664,
      "name": "scatterbug",
      "weight": 25,
      "height": 3,
      "base_experience": 40,
      "is_default": true,
      "order": 744
    },
    {
      "id": 665,
      "name": "spewpa",
      "weight": 84,
      "height": 3,
      "base_experience": 75,
      "is_default": true,
      "order": 745
    },
    {
      "id": 666,
      "name": "vivillon",
      "weight": 170,
      "height": 12,
      "base_experience": 185,
      "is_default": true,
      "order": 746
    },
    {
      "id": 667,
      "name": "litleo",
      "weight": 135,
      "height": 6,
      "base_experience": 74,
      "is_default": true,
      "order": 747
    },
    {
      "id": 668,
      "name": "pyroar",
      "weight": 815,
      "height": 15,
      "base_experience": 177,
      "is_default": true,
      "order": 748
    },
    {
      "id": 669,
      "name": "flabebe",
      "weight": 1,
      "height": 1,
      "base_experience": 61,
      "is_default": true,
      "order": 749
    },
    {
      "id": 670,
      "name": "floette",
      "weight": 9,
      "height": 2,
      "base_experience": 130,
      "is_default": true,
      "order": 750
    },
    {
      "id": 671,
      "name": "florges",
      "weight": 100,
      "height": 11,
      "base_experience": 248,
      "is_default": true,
      "order": 752
    },
    {
      "id": 672,
      "name": "skiddo",
      "weight": 310,
      "height": 9,
      "base_experience": 70,
      "is_default": true,
      "order": 753
    },
    {
      "id": 673,
      "name": "gogoat",
      "weight": 910,
      "height": 17,
      "base_experience": 186,
      "is_default": true,
      "order": 754
    },
    {
      "id": 674,
      "name": "pancham",
      "weight": 80,
      "height": 6,
      "base_experience": 70,
      "is_default": true,
      "order": 755
    },
    {
      "id": 675,
      "name": "pangoro",
      "weight": 1360,
      "height": 21,
      "base_experience": 173,
      "is_default": true,
      "order": 756
    },
    {
      "id": 676,
      "name": "furfrou",
      "weight": 280,
      "height": 12,
      "base_experience": 165,
      "is_default": true,
      "order": 757
    },
    {
      "id": 677,
      "name": "espurr",
      "weight": 35,
      "height": 3,
      "base_experience": 71,
      "is_default": true,
      "order": 758
    },
    {
      "id": 678,
      "name": "meowstic-male",
      "weight": 85,
      "height": 6,
      "base_experience": 163,
      "is_default": true,
      "order": 759
    },
    {
      "id": 679,
      "name": "honedge",
      "weight": 20,
      "height": 8,
      "base_experience": 65,
      "is_default": true,
      "order": 761
    },
    {
      "id": 680,
      "name": "doublade",
      "weight": 45,
      "height": 8,
      "base_experience": 157,
      "is_default": true,
      "order": 762
    },
    {
      "id": 681,
      "name": "aegislash-shield",
      "weight": 530,
      "height": 17,
      "base_experience": 234,
      "is_default": true,
      "order": 763
    },
    {
      "id": 682,
      "name": "spritzee",
      "weight": 5,
      "height": 2,
      "base_experience": 68,
      "is_default": true,
      "order": 765
    },
    {
      "id": 683,
      "name": "aromatisse",
      "weight": 155,
      "height": 8,
      "base_experience": 162,
      "is_default": true,
      "order": 766
    },
    {
      "id": 684,
      "name": "swirlix",
      "weight": 35,
      "height": 4,
      "base_experience": 68,
      "is_default": true,
      "order": 767
    },
    {
      "id": 685,
      "name": "slurpuff",
      "weight": 50,
      "height": 8,
      "base_experience": 168,
      "is_default": true,
      "order": 768
    },
    {
      "id": 686,
      "name": "inkay",
      "weight": 35,
      "height": 4,
      "base_experience": 58,
      "is_default": true,
      "order": 769
    },
    {
      "id": 687,
      "name": "malamar",
      "weight": 470,
      "height": 15,
      "base_experience": 169,
      "is_default": true,
      "order": 770
    },
    {
      "id": 688,
      "name": "binacle",
      "weight": 310,
      "height": 5,
      "base_experience": 61,
      "is_default": true,
      "order": 771
    },
    {
      "id": 689,
      "name": "barbaracle",
      "weight": 960,
      "height": 13,
      "base_experience": 175,
      "is_default": true,
      "order": 772
    },
    {
      "id": 690,
      "name": "skrelp",
      "weight": 73,
      "height": 5,
      "base_experience": 64,
      "is_default": true,
      "order": 773
    },
    {
      "id": 691,
      "name": "dragalge",
      "weight": 815,
      "height": 18,
      "base_experience": 173,
      "is_default": true,
      "order": 774
    },
    {
      "id": 692,
      "name": "clauncher",
      "weight": 83,
      "height": 5,
      "base_experience": 66,
      "is_default": true,
      "order": 775
    },
    {
      "id": 693,
      "name": "clawitzer",
      "weight": 353,
      "height": 13,
      "base_experience": 100,
      "is_default": true,
      "order": 776
    },
    {
      "id": 694,
      "name": "helioptile",
      "weight": 60,
      "height": 5,
      "base_experience": 58,
      "is_default": true,
      "order": 777
    },
    {
      "id": 695,
      "name": "heliolisk",
      "weight": 210,
      "height": 10,
      "base_experience": 168,
      "is_default": true,
      "order": 778
    },
    {
      "id": 696,
      "name": "tyrunt",
      "weight": 260,
      "height": 8,
      "base_experience": 72,
      "is_default": true,
      "order": 779
    },
    {
      "id": 697,
      "name": "tyrantrum",
      "weight": 2700,
      "height": 25,
      "base_experience": 182,
      "is_default": true,
      "order": 780
    },
    {
      "id": 698,
      "name": "amaura",
      "weight": 252,
      "height": 13,
      "base_experience": 72,
      "is_default": true,
      "order": 781
    },
    {
      "id": 699,
      "name": "aurorus",
      "weight": 2250,
      "height": 27,
      "base_experience": 104,
      "is_default": true,
      "order": 782
    },
    {
      "id": 700,
      "name": "sylveon",
      "weight": 235,
      "height": 10,
      "base_experience": 184,
      "is_default": true,
      "order": 185
    },
    {
      "id": 701,
      "name": "hawlucha",
      "weight": 215,
      "height": 8,
      "base_experience": 175,
      "is_default": true,
      "order": 783
    },
    {
      "id": 702,
      "name": "dedenne",
      "weight": 22,
      "height": 2,
      "base_experience": 151,
      "is_default": true,
      "order": 784
    },
    {
      "id": 703,
      "name": "carbink",
      "weight": 57,
      "height": 3,
      "base_experience": 100,
      "is_default": true,
      "order": 785
    },
    {
      "id": 704,
      "name": "goomy",
      "weight": 28,
      "height": 3,
      "base_experience": 60,
      "is_default": true,
      "order": 786
    },
    {
      "id": 705,
      "name": "sliggoo",
      "weight": 175,
      "height": 8,
      "base_experience": 158,
      "is_default": true,
      "order": 787
    },
    {
      "id": 706,
      "name": "goodra",
      "weight": 1505,
      "height": 20,
      "base_experience": 270,
      "is_default": true,
      "order": 788
    },
    {
      "id": 707,
      "name": "klefki",
      "weight": 30,
      "height": 2,
      "base_experience": 165,
      "is_default": true,
      "order": 789
    },
    {
      "id": 708,
      "name": "phantump",
      "weight": 70,
      "height": 4,
      "base_experience": 62,
      "is_default": true,
      "order": 790
    },
    {
      "id": 709,
      "name": "trevenant",
      "weight": 710,
      "height": 15,
      "base_experience": 166,
      "is_default": true,
      "order": 791
    },
    {
      "id": 710,
      "name": "pumpkaboo-average",
      "weight": 50,
      "height": 4,
      "base_experience": 67,
      "is_default": true,
      "order": 793
    },
    {
      "id": 711,
      "name": "gourgeist-average",
      "weight": 125,
      "height": 9,
      "base_experience": 173,
      "is_default": true,
      "order": 797
    },
    {
      "id": 712,
      "name": "bergmite",
      "weight": 995,
      "height": 10,
      "base_experience": 61,
      "is_default": true,
      "order": 800
    },
    {
      "id": 713,
      "name": "avalugg",
      "weight": 5050,
      "height": 20,
      "base_experience": 180,
      "is_default": true,
      "order": 801
    },
    {
      "id": 714,
      "name": "noibat",
      "weight": 80,
      "height": 5,
      "base_experience": 49,
      "is_default": true,
      "order": 802
    },
    {
      "id": 715,
      "name": "noivern",
      "weight": 850,
      "height": 15,
      "base_experience": 187,
      "is_default": true,
      "order": 803
    },
    {
      "id": 716,
      "name": "xerneas",
      "weight": 2150,
      "height": 30,
      "base_experience": 306,
      "is_default": true,
      "order": 804
    },
    {
      "id": 717,
      "name": "yveltal",
      "weight": 2030,
      "height": 58,
      "base_experience": 306,
      "is_default": true,
      "order": 805
    },
    {
      "id": 718,
      "name": "zygarde",
      "weight": 3050,
      "height": 50,
      "base_experience": 270,
      "is_default": true,
      "order": 806
    },
    {
      "id": 719,
      "name": "diancie",
      "weight": 88,
      "height": 7,
      "base_experience": 270,
      "is_default": true,
      "order": 807
    },
    {
      "id": 720,
      "name": "hoopa",
      "weight": 90,
      "height": 5,
      "base_experience": 270,
      "is_default": true,
      "order": 809
    },
    {
      "id": 721,
      "name": "volcanion",
      "weight": 1950,
      "height": 17,
      "base_experience": 270,
      "is_default": true,
      "order": 811
    },
    {
      "id": 10001,
      "name": "deoxys-attack",
      "weight": 608,
      "height": 17,
      "base_experience": 270,
      "is_default": false,
      "order": 470
    },
    {
      "id": 10002,
      "name": "deoxys-defense",
      "weight": 608,
      "height": 17,
      "base_experience": 270,
      "is_default": false,
      "order": 471
    },
    {
      "id": 10003,
      "name": "deoxys-speed",
      "weight": 608,
      "height": 17,
      "base_experience": 270,
      "is_default": false,
      "order": 472
    },
    {
      "id": 10004,
      "name": "wormadam-sandy",
      "weight": 65,
      "height": 5,
      "base_experience": 148,
      "is_default": false,
      "order": 498
    },
    {
      "id": 10005,
      "name": "wormadam-trash",
      "weight": 65,
      "height": 5,
      "base_experience": 148,
      "is_default": false,
      "order": 499
    },
    {
      "id": 10006,
      "name": "shaymin-sky",
      "weight": 52,
      "height": 4,
      "base_experience": 270,
      "is_default": false,
      "order": 562
    },
    {
      "id": 10007,
      "name": "giratina-origin",
      "weight": 6500,
      "height": 69,
      "base_experience": 306,
      "is_default": false,
      "order": 556
    },
    {
      "id": 10008,
      "name": "rotom-heat",
      "weight": 3,
      "height": 3,
      "base_experience": 182,
      "is_default": false,
      "order": 543
    },
    {
      "id": 10009,
      "name": "rotom-wash",
      "weight": 3,
      "height": 3,
      "base_experience": 182,
      "is_default": false,
      "order": 544
    },
    {
      "id": 10010,
      "name": "rotom-frost",
      "weight": 3,
      "height": 3,
      "base_experience": 182,
      "is_default": false,
      "order": 545
    },
    {
      "id": 10011,
      "name": "rotom-fan",
      "weight": 3,
      "height": 3,
      "base_experience": 182,
      "is_default": false,
      "order": 546
    },
    {
      "id": 10012,
      "name": "rotom-mow",
      "weight": 3,
      "height": 3,
      "base_experience": 182,
      "is_default": false,
      "order": 547
    },
    {
      "id": 10013,
      "name": "castform-sunny",
      "weight": 8,
      "height": 3,
      "base_experience": 147,
      "is_default": false,
      "order": 420
    },
    {
      "id": 10014,
      "name": "castform-rainy",
      "weight": 8,
      "height": 3,
      "base_experience": 147,
      "is_default": false,
      "order": 421
    },
    {
      "id": 10015,
      "name": "castform-snowy",
      "weight": 8,
      "height": 3,
      "base_experience": 147,
      "is_default": false,
      "order": 422
    },
    {
      "id": 10016,
      "name": "basculin-blue-striped",
      "weight": 180,
      "height": 10,
      "base_experience": 161,
      "is_default": false,
      "order": 622
    },
    {
      "id": 10017,
      "name": "darmanitan-zen",
      "weight": 929,
      "height": 13,
      "base_experience": 189,
      "is_default": false,
      "order": 628
    },
    {
      "id": 10018,
      "name": "meloetta-pirouette",
      "weight": 65,
      "height": 6,
      "base_experience": 270,
      "is_default": false,
      "order": 728
    },
    {
      "id": 10019,
      "name": "tornadus-therian",
      "weight": 630,
      "height": 14,
      "base_experience": 261,
      "is_default": false,
      "order": 715
    },
    {
      "id": 10020,
      "name": "thundurus-therian",
      "weight": 610,
      "height": 30,
      "base_experience": 261,
      "is_default": false,
      "order": 717
    },
    {
      "id": 10021,
      "name": "landorus-therian",
      "weight": 680,
      "height": 13,
      "base_experience": 270,
      "is_default": false,
      "order": 721
    },
    {
      "id": 10022,
      "name": "kyurem-black",
      "weight": 3250,
      "height": 33,
      "base_experience": 315,
      "is_default": false,
      "order": 723
    },
    {
      "id": 10023,
      "name": "kyurem-white",
      "weight": 3250,
      "height": 36,
      "base_experience": 315,
      "is_default": false,
      "order": 724
    },
    {
      "id": 10024,
      "name": "keldeo-resolute",
      "weight": 485,
      "height": 14,
      "base_experience": 261,
      "is_default": false,
      "order": 726
    },
    {
      "id": 10025,
      "name": "meowstic-female",
      "weight": 85,
      "height": 6,
      "base_experience": 163,
      "is_default": false,
      "order": 760
    },
    {
      "id": 10026,
      "name": "aegislash-blade",
      "weight": 530,
      "height": 17,
      "base_experience": 234,
      "is_default": false,
      "order": 764
    },
    {
      "id": 10027,
      "name": "pumpkaboo-small",
      "weight": 35,
      "height": 3,
      "base_experience": 67,
      "is_default": false,
      "order": 792
    },
    {
      "id": 10028,
      "name": "pumpkaboo-large",
      "weight": 75,
      "height": 5,
      "base_experience": 67,
      "is_default": false,
      "order": 794
    },
    {
      "id": 10029,
      "name": "pumpkaboo-super",
      "weight": 150,
      "height": 8,
      "base_experience": 67,
      "is_default": false,
      "order": 795
    },
    {
      "id": 10030,
      "name": "gourgeist-small",
      "weight": 95,
      "height": 7,
      "base_experience": 173,
      "is_default": false,
      "order": 796
    },
    {
      "id": 10031,
      "name": "gourgeist-large",
      "weight": 140,
      "height": 11,
      "base_experience": 173,
      "is_default": false,
      "order": 798
    },
    {
      "id": 10032,
      "name": "gourgeist-super",
      "weight": 390,
      "height": 17,
      "base_experience": 173,
      "is_default": false,
      "order": 799
    },
    {
      "id": 10033,
      "name": "venusaur-mega",
      "weight": 1555,
      "height": 24,
      "base_experience": 281,
      "is_default": false,
      "order": 4
    },
    {
      "id": 10034,
      "name": "charizard-mega-x",
      "weight": 1105,
      "height": 17,
      "base_experience": 285,
      "is_default": false,
      "order": 8
    },
    {
      "id": 10035,
      "name": "charizard-mega-y",
      "weight": 1005,
      "height": 17,
      "base_experience": 285,
      "is_default": false,
      "order": 9
    },
    {
      "id": 10036,
      "name": "blastoise-mega",
      "weight": 1011,
      "height": 16,
      "base_experience": 284,
      "is_default": false,
      "order": 13
    },
    {
      "id": 10037,
      "name": "alakazam-mega",
      "weight": 480,
      "height": 12,
      "base_experience": 266,
      "is_default": false,
      "order": 84
    },
    {
      "id": 10038,
      "name": "gengar-mega",
      "weight": 405,
      "height": 14,
      "base_experience": 270,
      "is_default": false,
      "order": 117
    },
    {
      "id": 10039,
      "name": "kangaskhan-mega",
      "weight": 1000,
      "height": 22,
      "base_experience": 207,
      "is_default": false,
      "order": 148
    },
    {
      "id": 10040,
      "name": "pinsir-mega",
      "weight": 590,
      "height": 17,
      "base_experience": 210,
      "is_default": false,
      "order": 170
    },
    {
      "id": 10041,
      "name": "gyarados-mega",
      "weight": 3050,
      "height": 65,
      "base_experience": 224,
      "is_default": false,
      "order": 174
    },
    {
      "id": 10042,
      "name": "aerodactyl-mega",
      "weight": 790,
      "height": 21,
      "base_experience": 215,
      "is_default": false,
      "order": 194
    },
    {
      "id": 10043,
      "name": "mewtwo-mega-x",
      "weight": 1270,
      "height": 23,
      "base_experience": 351,
      "is_default": false,
      "order": 204
    },
    {
      "id": 10044,
      "name": "mewtwo-mega-y",
      "weight": 330,
      "height": 15,
      "base_experience": 351,
      "is_default": false,
      "order": 205
    },
    {
      "id": 10045,
      "name": "ampharos-mega",
      "weight": 615,
      "height": 14,
      "base_experience": 275,
      "is_default": false,
      "order": 234
    },
    {
      "id": 10046,
      "name": "scizor-mega",
      "weight": 1250,
      "height": 20,
      "base_experience": 210,
      "is_default": false,
      "order": 160
    },
    {
      "id": 10047,
      "name": "heracross-mega",
      "weight": 625,
      "height": 17,
      "base_experience": 210,
      "is_default": false,
      "order": 269
    },
    {
      "id": 10048,
      "name": "houndoom-mega",
      "weight": 495,
      "height": 19,
      "base_experience": 210,
      "is_default": false,
      "order": 288
    },
    {
      "id": 10049,
      "name": "tyranitar-mega",
      "weight": 2550,
      "height": 25,
      "base_experience": 315,
      "is_default": false,
      "order": 300
    },
    {
      "id": 10050,
      "name": "blaziken-mega",
      "weight": 520,
      "height": 19,
      "base_experience": 284,
      "is_default": false,
      "order": 311
    },
    {
      "id": 10051,
      "name": "gardevoir-mega",
      "weight": 484,
      "height": 16,
      "base_experience": 278,
      "is_default": false,
      "order": 338
    },
    {
      "id": 10052,
      "name": "mawile-mega",
      "weight": 235,
      "height": 10,
      "base_experience": 168,
      "is_default": false,
      "order": 363
    },
    {
      "id": 10053,
      "name": "aggron-mega",
      "weight": 3950,
      "height": 22,
      "base_experience": 284,
      "is_default": false,
      "order": 367
    },
    {
      "id": 10054,
      "name": "medicham-mega",
      "weight": 315,
      "height": 13,
      "base_experience": 179,
      "is_default": false,
      "order": 370
    },
    {
      "id": 10055,
      "name": "manectric-mega",
      "weight": 440,
      "height": 18,
      "base_experience": 201,
      "is_default": false,
      "order": 373
    },
    {
      "id": 10056,
      "name": "banette-mega",
      "weight": 130,
      "height": 12,
      "base_experience": 194,
      "is_default": false,
      "order": 426
    },
    {
      "id": 10057,
      "name": "absol-mega",
      "weight": 490,
      "height": 12,
      "base_experience": 198,
      "is_default": false,
      "order": 434
    },
    {
      "id": 10058,
      "name": "garchomp-mega",
      "weight": 950,
      "height": 19,
      "base_experience": 315,
      "is_default": false,
      "order": 526
    },
    {
      "id": 10059,
      "name": "lucario-mega",
      "weight": 575,
      "height": 13,
      "base_experience": 219,
      "is_default": false,
      "order": 529
    },
    {
      "id": 10060,
      "name": "abomasnow-mega",
      "weight": 1850,
      "height": 27,
      "base_experience": 208,
      "is_default": false,
      "order": 541
    },
    {
      "id": 10061,
      "name": "floette-eternal",
      "weight": 9,
      "height": 2,
      "base_experience": 243,
      "is_default": false,
      "order": 751
    },
    {
      "id": 10062,
      "name": "latias-mega",
      "weight": 520,
      "height": 18,
      "base_experience": 315,
      "is_default": false,
      "order": 459
    },
    {
      "id": 10063,
      "name": "latios-mega",
      "weight": 700,
      "height": 23,
      "base_experience": 315,
      "is_default": false,
      "order": 461
    },
    {
      "id": 10064,
      "name": "swampert-mega",
      "weight": 1020,
      "height": 190,
      "base_experience": 286,
      "is_default": false,
      "order": 315
    },
    {
      "id": 10065,
      "name": "sceptile-mega",
      "weight": 552,
      "height": 190,
      "base_experience": 284,
      "is_default": false,
      "order": 307
    },
    {
      "id": 10066,
      "name": "sableye-mega",
      "weight": 1610,
      "height": 50,
      "base_experience": 168,
      "is_default": false,
      "order": 361
    },
    {
      "id": 10067,
      "name": "altaria-mega",
      "weight": 206,
      "height": 150,
      "base_experience": 207,
      "is_default": false,
      "order": 402
    },
    {
      "id": 10068,
      "name": "gallade-mega",
      "weight": 564,
      "height": 160,
      "base_experience": 278,
      "is_default": false,
      "order": 340
    },
    {
      "id": 10069,
      "name": "audino-mega",
      "weight": 320,
      "height": 150,
      "base_experience": 425,
      "is_default": false,
      "order": 602
    },
    {
      "id": 10070,
      "name": "sharpedo-mega",
      "weight": 1303,
      "height": 250,
      "base_experience": 196,
      "is_default": false,
      "order": 385
    },
    {
      "id": 10071,
      "name": "slowbro-mega",
      "weight": 1200,
      "height": 200,
      "base_experience": 207,
      "is_default": false,
      "order": 100
    },
    {
      "id": 10072,
      "name": "steelix-mega",
      "weight": 7400,
      "height": 1050,
      "base_experience": 214,
      "is_default": false,
      "order": 120
    },
    {
      "id": 10073,
      "name": "pidgeot-mega",
      "weight": 505,
      "height": 220,
      "base_experience": 261,
      "is_default": false,
      "order": 24
    },
    {
      "id": 10074,
      "name": "glalie-mega",
      "weight": 3502,
      "height": 210,
      "base_experience": 203,
      "is_default": false,
      "order": 437
    },
    {
      "id": 10075,
      "name": "diancie-mega",
      "weight": 278,
      "height": 110,
      "base_experience": 315,
      "is_default": false,
      "order": 808
    },
    {
      "id": 10076,
      "name": "metagross-mega",
      "weight": 9429,
      "height": 250,
      "base_experience": 315,
      "is_default": false,
      "order": 454
    },
    {
      "id": 10077,
      "name": "kyogre-primal",
      "weight": 4300,
      "height": 980,
      "base_experience": 347,
      "is_default": false,
      "order": 463
    },
    {
      "id": 10078,
      "name": "groudon-primal",
      "weight": 9997,
      "height": 500,
      "base_experience": 347,
      "is_default": false,
      "order": 465
    },
    {
      "id": 10079,
      "name": "rayquaza-mega",
      "weight": 3920,
      "height": 1080,
      "base_experience": 351,
      "is_default": false,
      "order": 467
    },
    {
      "id": 10080,
      "name": "pikachu-rock-star",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 34
    },
    {
      "id": 10081,
      "name": "pikachu-belle",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 35
    },
    {
      "id": 10082,
      "name": "pikachu-pop-star",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 36
    },
    {
      "id": 10083,
      "name": "pikachu-phd",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 37
    },
    {
      "id": 10084,
      "name": "pikachu-libre",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 38
    },
    {
      "id": 10085,
      "name": "pikachu-cosplay",
      "weight": 60,
      "height": 40,
      "base_experience": 112,
      "is_default": false,
      "order": 33
    },
    {
      "id": 10086,
      "name": "hoopa-unbound",
      "weight": 4900,
      "height": 650,
      "base_experience": 306,
      "is_default": false,
      "order": 810
    },
    {
      "id": 10087,
      "name": "camerupt-mega",
      "weight": 3205,
      "height": 250,
      "base_experience": 196,
      "is_default": false,
      "order": 390
    },
    {
      "id": 10088,
      "name": "lopunny-mega",
      "weight": 283,
      "height": 130,
      "base_experience": 203,
      "is_default": false,
      "order": 514
    },
    {
      "id": 10089,
      "name": "salamence-mega",
      "weight": 1126,
      "height": 180,
      "base_experience": 315,
      "is_default": false,
      "order": 450
    },
    {
      "id": 10090,
      "name": "beedrill-mega",
      "weight": 405,
      "height": 140,
      "base_experience": 223,
      "is_default": false,
      "order": 20
    },
  ];


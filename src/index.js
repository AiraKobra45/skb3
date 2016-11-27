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

function getPets(base1, pet) {
  let len = base1.length;
  let timeBase = [];
  for (var i = 0; i < base1.length;  i++) {
    if (base1[i].type == pet) {
      //console.log(base1[i]);
      timeBase.push(base1[i]);
    }
  }
  return timeBase;
}

app.get('/task3B/users/:id1', async(req, res) => {
  const have_pet = req.query.havePet;
  const id = req.params.id1;
  const user = base.users;
  const len = user.length;
  let ans = [];
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
app.listen(3000, () => {
  console.log('****************************************************************************************************************************************************************Your app listening on port 3000!');
});

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Promise from 'bluebird';
import saveDataInDb from './saveDataInDb';

mongoose.Promise = Promise;
mongoose.connect('mongodb://publicdb.mgbeta.ru/airakobra45_skb3');

const app = express();
app.use(cors());

app.get('/users', (req, res) => {

});
app.post('/data', (req, res) => {
  const data = {
    user: {
      name: 'AiraKobra45'
    },
    pets: [
      {
        name: 'Марсик',
        type: 'cat'
      },
      {
        name: 'Рикки',
        type: 'dog'
      }
    ]
  };
  saveDataInDb(data);

});



app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});

//async function saveInDb(data) {
//  try {
//    const user = new User (data.user);
//    await user.save();
//    const promises = data.pets.map(pet => {
//      const petData = Object.assign({}, pet, {
//        owner: user._id
//      });
//      const pet = new Pet(petData);
//      return pet.save();
//    });
//    await Promise.all(promises);
//    console.log('success');
//  } catch (err) {
//    console.log('error', err);
//  }
//
//  data.user
//}

//const kitty = new Pet({
//  name: 'AFHEAF',
//  type: 'cat'
//});
//
//kitty.save()
//  .then(() => {
//    console.log('success');
//})
//  .catch((err) => {
//    console.log('err', err);
//});


//app.get('/', (req, res) => {
//  res.json({
//    hello: 'JS World',
//  });
//});
//
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/test');
//
//var Cat = mongoose.model('Cat', { name: String });
//
//var kitty = new Cat({ name: 'Zildjian' });
//kitty.save(function (err) {
//  if (err) {
//    console.log(err);
//  } else {
//    console.log('meow');
//  }
//});



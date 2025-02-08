import express from 'express';
import { userRoute } from './router/user';


const app = express();

app.get('/', (req, res) => {
  res.send('Hello Babe kya kar rahi ho!');
});


app.use('/user-data', userRoute);

app.use('/chat',);

app.use('/')


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

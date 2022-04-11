const express = require('express');

const app = express();
const peopleRouter = express.Router();
const port = process.env.port || 3000;

peopleRouter.route('/people')
  .get((req, res) => {
    const response = { hello: 'some people' };

    res.json(response);
  });
app.use('/api', peopleRouter);

app.get('/', (req, res) => {
  res.send('welcome to my nodemon tfg-API!')
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});


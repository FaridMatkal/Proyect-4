const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // Importar uuid

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Estructura de datos en memoria
let users = [];
let exercises = [];

// Ruta para crear un nuevo usuario
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = uuidv4(); // Generar un nuevo ID único
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// Ruta para obtener todos los usuarios
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Ruta para añadir un ejercicio a un usuario
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    _id: uuidv4(), // Generar un nuevo ID único para el ejercicio
    userId,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };

  exercises.push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

// Ruta para obtener el log de ejercicios de un usuario
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(e => e.userId === userId);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

// Iniciar el servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

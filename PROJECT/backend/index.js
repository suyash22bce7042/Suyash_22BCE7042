
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/student_feedback', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const feedbackSchema = new mongoose.Schema({
  name: String,
  message: String,
  rating: Number,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
const User = mongoose.model('User', userSchema);


app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(409).send({ error: 'User already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  res.status(201).send({ message: 'User created' });
});


app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).send({ error: 'User not found' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send({ error: 'Incorrect password' });
  res.send({ message: 'Login successful', username });
});


app.post('/feedback', async (req, res) => {
  const fb = new Feedback(req.body);
  await fb.save();
  res.status(201).send(fb);
});

app.get('/feedbacks', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.send(feedbacks);
});

app.put('/feedback/:id', async (req, res) => {
  const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(updated);
});

app.delete('/feedback/:id', async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.send({ message: 'Feedback deleted' });
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});

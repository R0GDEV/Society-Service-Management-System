const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
var bodyParser = require("body-parser");
const { Resend } = require('resend');
const port = 3001;
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const date = new Date().toLocaleDateString();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = 'MongoDB-Atlas_URL';
const resend = new Resend("Enter_API_Key");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.static(path.join(__dirname, 'views')));

async function find() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Notice');
    const cursor = collection.find().sort({ date: -1 });
    const notices = await cursor.toArray();
    return notices;
  } finally {
    await client.close();
  }
}

async function insertNotice(notice) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Notice');
    await collection.insertOne(notice);
    await email();
  } catch (error) {
    console.error('Error inserting notice:', error);
  }
  finally {
    await client.close();
  }
}

async function booking_i(data) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Booking');
    await collection.insertOne(data);
  } catch (error) {
    console.error('Error', error);
  }
  finally {
    await client.close();
  }
}

async function find_Booking() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Booking');
    const cursor = collection.find().sort({ date: -1 });
    const data = await cursor.toArray();
    return data;
  } finally {
    await client.close();
  }
}

async function insert_c(data) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Complaint');
    await collection.insertOne(data);
  } catch (error) {
    console.error('Error inserting notice:', error);
    await client.close();
  }
}
async function find_c() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Complaint');
    const cursor = collection.find().sort({ date: -1 });
    const notices = await cursor.toArray();
    return notices;
  } finally {
    await client.close();
  }
}

async function Maintain(data) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Maintenan');
    await collection.insertOne(data);
  } catch (error) {
    console.error('Error inserting notice:', error);
  }
  finally {
    await client.close();
  }
}

async function Maintenan_R() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Maintenan');
    const cursor = await collection.find().filter({ status: "Issue" }).sort({ date: -1 });
    const notices = await cursor.toArray();
    return notices;
  } finally {
    await client.close();
  }
}
async function Maintenan_s() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Maintenan');
    const cursor = await collection.find().filter({ status: "solve" });
    const notices = await cursor.toArray();
    return notices;
  } finally {
    await client.close();
  }
}

async function register(data) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('USER_INfO');
    const user = await collection.insertOne(data);
    return new Promise((resolve) => {
      resolve('User Create ');
    });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error occurred during user creation');
  } finally {
    await client.close();
  }
};

async function user_list() {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('USER_INfO');
    const cursor = collection.find();
    const user_list = await cursor.toArray();
    return user_list;
  } finally {
    await client.close();
  }
}



async function email() {
  const data1 = await resend.emails.send({
    from: "SSM System <onboarding@resend.dev>",
    to: ['Sender_Email'],
    subject: "SSM System",
    html: `
    <body style="background-color:snow;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
    <div id="dialog" style="   margin: 0 auto;padding: 1rem 3rem;max-width: 50%;">
        <P id="name" style="  font-weight: 400;font-size: 32px;text-align: center;padding: 1.5rem 0rem;border-radius: 20px;background-image: linear-gradient(to right, #e7aaf1, #00BCD4);"><b>SSM System</b></P>
        <h1 style="font-size:20px;text-align:left;margin-top: 100px;">Dear Members,</h1>
        <h2 style="font-size:20px;text-align:center;margin: 30px;">This email is to inform you about a new notice has been added.</h2>
        <p style="font-size:16px;line-height:24px;margin:16px 0"><b>Time:</b>${date}</p>
        <p style="font-size:16px;line-height:24px;margin:16px 0">Please log in to our platform to view the details and stay updated with the latest information.</p>
        <p style="font-size:16px;line-height:24px;margin:16px 0;margin-top:5px;margin-bottom:20%">Thank you for your attention.</p>
        <p style="font-size:12px;line-height:24px;margin:16px 0;text-align:center;color:rgb(0,0,0, 0.7)">©2024 | SSMS Inc., Maharashtra, India</p>
    </div>
  </body>`,
  });
}



app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false
  }
}));



async function authenticateUser(username, password) {
  await client.connect();
  const db = client.db('DATA_COLLECTION');
  const collection = db.collection('USER_INfO');
  const query = { username: username };
  const user = await collection.findOne(query);
  await client.close();
  return new Promise((resolve, reject) => {
    if (user.password == password) {
      resolve({ user: { username, password, role: user.role } });
    } else {
      reject('Invalid username or password');
    }
  });
};


app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authenticateUser(username, password); // Call your authentication function

    if (!user) { // Check if authentication was successful
      return res.status(401).send({ message: 'Incorrect username or password' });
    }
    req.session.user = user; // Store user object in session
    res.redirect('/home'); // Redirect to home page on successful login
  } catch (error) {
    console.error(error); // Log errors for debugging
    res.status(500).send({ message: 'Internal server error' }); // Generic error message for unexpected errors
  }
});

app.post('/register', async (req, res) => {
  const { username, password, email, flat_no } = req.body;
  try {
    data = {
      username,
      password,
      email,
      flat_no,
      role: "User"
    }
    const user = await register(data);
    res.redirect('/login'); // Redirect after successful login
  } catch (error) {
    res.status(401).send('Invalid username or password12');
  }
});


app.get('/', (req, res) => {
  res.redirect('/login');
});


app.post('/notices', async (req, res) => {
  try {
    const { description } = req.body;
    const notice = {
      description,
      date
    };
    await insertNotice(notice);
    res.redirect("/notices");
  } catch (error) {
    console.error('Error inserting notice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/notices', isAdmin, async (req, res) => {
  const user = req.session.user;
  req.session.user = user;
  const notices = await find();
  res.render('notices', { notices: notices, isAdmin: req.isAdmin });

});

// Route to drop (delete) a notice
app.delete('/notices/:id', async (req, res) => {
  try {

    const { id } = req.params;
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Notice');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(200).send('Notice deleted successfully');
    } else {
      res.status(404).send('Notice not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


function isAdmin(req, res, next) {
  const user = req.session.user;
  if (user.user && user.user.role === 'Admin') {
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
  }
  next();
}


app.get('/list', isAdmin, async (req, res) => {
  const user = req.session.user;
  req.session.user = user;
  const users = await user_list();
  res.render('user', { users, isAdmin: req.isAdmin });
});


app.post('/adduser', async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    data = {
      username,
      password,
      email,
      role: role
    }
    console.log(data);
    const user = await register(data);
    res.redirect("/list");
  } catch (error) {
    res.status(401).send('Invalid username or password12');
  }
});
app.put('/users/:userId/role', async (req, res) => {
  const userId = req.params.userId;
  const newRole = req.body.role;
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('USER_INfO');

    // Wait for the findOneAndUpdate operation to complete
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );
  } finally {
    await client.close();
  }
});


app.get('/booking', async (req, res) => {
  const user = req.session.user;
  const data = await find_Booking();
  res.render('booking', { bookings: data });
});


async function find_Booking1(data1) {
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Booking');
    const query = {
      date: data1.date,
      facility: data1.facility
    };
    const cursor = await collection.find(query);
    const data = await cursor.toArray();
    return data;
  } finally {
    await client.close();
  }
}

async function validateBooking(newBooking) {
  try {
    // Get existing bookings for the same date and facility
    const existingBookings = await find_Booking1(newBooking);
    // Check for overlapping time slots
    const overlappingBooking = existingBookings.find(booking =>
      (booking.startTime < newBooking.endTime && booking.endTime > newBooking.startTime) ||
      (newBooking.startTime < booking.endTime && newBooking.endTime > booking.startTime)
    );

    if (overlappingBooking) {
      return { success: false };
    } else {
      return { success: true };
    }
  } catch (error) {
    console.error("Error validating booking:", error);
    return { success: false };
  }
}

app.post("/booking", async (req, res) => {
  const user = req.session.user;
  try {
    const newBooking = {
      username: user.user.username,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      facility: req.body.facility
    };

    // console.log(newBooking);
    const validation = await validateBooking(newBooking);
    if (!validation.success) {
      return res.status(400).send({ message: 'Validation failed' });
    }

    await booking_i(newBooking);
    return res.status(201).send({ message: "Booking successful." });
  } catch (error) {
    console.error("Error handling booking request:", error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

const checkUserRole = (req, res, next) => {
  const user = req.session.user;
  const userRole = user.user.role;
  if (userRole != 'Service') {
    next();
  } else {
    res.redirect('/request');
  }
};

app.get('/request', async (req, res) => {
  const data = await Maintenan_R();
  res.render('request_list', { Maintenan: data });
});
app.put('/request/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Maintenan');
    // Wait for the findOneAndUpdate operation to complete
    const result = await collection.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { status: "solve" } });
    if (result) {
      res.status(200).send('successfully');
    } else {
      res.status(404).send('not found');
    }
    // Log the updated document or null if no document was updated
    //console.log(result);
  } finally {
    // Ensure client closure even in case of errors
    await client.close();
  }
});

app.get('/MaintenanRequest', isAdmin, checkUserRole, async (req, res) => {
  const user = req.session.user;
  req.session.user = user;
  if (req.isAdmin) {
    const data = await Maintenan_s();
    res.render('Maintenan', { Maintenan: data, isAdmin: req.isAdmin });
  } else {
    res.render('Maintenan', { isAdmin: req.isAdmin });
  }
});

app.post("/MaintenanRequest", async function (req, res) {
  const user = req.session.user;
  var { issueType, description, room_no } = req.body;

  data = {
    username: user.user.username,
    Room_no: room_no,
    Type: issueType,
    description: description,
    status: "Issue"
  }
  const result = await Maintain(data);
  res.redirect('/MaintenanRequest');

});





app.get('/Complanint', isAdmin, async (req, res) => {
  const user = req.session.user;
  req.session.user = user;
  //console.log(user);
  const data = await find_c();
  res.render('Complaint_list', { Complanint: data, isAdmin: req.isAdmin });
});

app.post("/Complanint", async function (req, res) {
  var { issueType, description } = req.body;
  const user = req.session.user;
  //console.log(user);
  const username = user.user.username;
  data = {
    username,
    type: issueType,
    Complaint: description,
    status: "Issue"
  }
  const Complaint = await insert_c(data);
  res.redirect('/Complanint');

});
app.put('/complaint/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    await client.connect();
    const db = client.db('DATA_COLLECTION');
    const collection = db.collection('Complaint');

    // Wait for the findOneAndUpdate operation to complete
    const result = await collection.findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { status: "solve" } });
    if (result) {
      res.status(200).send('Notice successfully');
    } else {
      res.status(404).send('Notice not found');
    }
  } finally {
    await client.close();
  }
});

// end
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
app.get('/home', (req, res) => {
  res.render('dashbord');
});


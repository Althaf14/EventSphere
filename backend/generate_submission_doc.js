const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Create the PDF
const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
});

const outputPath = path.join(__dirname, 'Project_Submission_Guide.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// --- Styling Helpers ---
const title = (text) => {
    doc.moveDown();
    doc.font('Times-Bold').fontSize(22).fillColor('#1E40AF').text(text);
    doc.moveDown(0.5);
};

const subtitle = (text) => {
    doc.moveDown();
    doc.font('Times-Bold').fontSize(16).fillColor('#111827').text(text);
    doc.moveDown(0.3);
};

const body = (text) => {
    doc.font('Times-Roman').fontSize(12).fillColor('#374151').text(text, { align: 'justify', lineGap: 2 });
};

const bold = (text) => {
    doc.font('Times-Bold').fontSize(12).fillColor('#111827').text(text, { continued: true });
};

const listItem = (text) => {
    doc.font('Times-Roman').fontSize(12).fillColor('#374151').text(`• ${text}`, { indent: 20 });
};

// --- CONTENT ---

// Main Title
doc.font('Times-Bold').fontSize(28).fillColor('#1E40AF').text('Event Sphere', { align: 'center' });
doc.fontSize(16).fillColor('#4B5563').text('College Event Management System', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12).fillColor('#9CA3AF').text('Project Submission Guide | Prepared for Tomorrow', { align: 'center' });
doc.moveDown(2);

title('1. What is "Event Sphere"?');
body('Imagine your college wants to host a big party or a quiz competition. Usually, people have to write names on paper, and things get messy. Event Sphere is like a "Digital Super-Tool" for your college. It helps teachers create events and see who is coming, and it helps students join events and get digital certificates automatically!');

title('2. How to Run the Project');
subtitle('Part A: The Brain (Backend)');
listItem('Open the "backend" folder in your terminal.');
listItem('Type "npm run dev" and press Enter.');
subtitle('Part B: The Face (Frontend)');
listItem('Open the "frontend" folder in your terminal.');
listItem('Type "npm run dev" and press Enter.');
listItem('Open your browser to http://localhost:5173.');

title('3. How to Use the App');
listItem('Login/Register: Create an account as a Student or Teacher.');
listItem('Dashboard: See cool charts about event data.');
listItem('Events Page: View all upcoming college activities.');
listItem('Register: Join events with a single click.');
listItem('Attendance: Teachers mark who attended the event.');
listItem('Certificates: Download signed PDFs if you attended!');

title('4. Deep Dive: What Each File Does');
subtitle('Backend (The Brain)');
listItem('server.js: The main starting point of the app.');
listItem('models/: Blueprints for data (User, Event, Attendance).');
listItem('controllers/: The "Thinking" logic for each feature.');
listItem('routes/: The paths (URLs) for talking to the backend.');
listItem('middleware/: The "Security Guard" (Auth & Errors).');

subtitle('Frontend (The Face)');
listItem('src/App.jsx: The Master Map showing all pages.');
listItem('src/pages/: The different full screens of the app.');
listItem('src/components/: Small parts like Buttons and Menus.');
listItem('src/context/: The "Global Memory" for login data.');

title('5. Tech Stack (MERN)');
listItem('backend/: Where the "Thinking" happens.');
listItem('frontend/: Where the "Showing" happens.');
listItem('Diagrams/: Where your project pictures are stored.');

title('6. 30 Viva Questions & Answers');

const questions = [
    ["What is the MERN stack?", "MongoDB, Express, React, and Node.js. It's a way to build websites using JavaScript."],
    ["Why use MongoDB?", "Because it stores data in easy-to-read lists (NoSQL)."],
    ["What is a Component?", "A small piece of the website, like a button, that we reuse."],
    ["What is JWT?", "A digital ID card to keep your login safe."],
    ["How do you hash passwords?", "We use Bcrypt to turn them into secret codes."],
    ["What is Middleware?", "A security guard checking if you are allowed to enter a page."],
    ["How do you generate PDFs?", "We use a tool called PDFKit in the backend."],
    ["What is the use of useState?", "To remember changing data, like a user's name."],
    ["What is an API?", "A bridge between the frontend and backend."],
    ["What is CRUD?", "Create, Read, Update, and Delete data."],
    ["What is Tailwind CSS?", "A tool to make the website look pretty and modern."],
    ["What is Vite?", "A tool that makes our website load very fast while coding."],
    ["What is a Schema?", "A rulebook for how data should look in our database."],
    ["What is Axios?", "The tool that sends messages between frontend and backend."],
    ["What is .env?", "A folder for secrets like database passwords."],
    ["Can students create events?", "No, only Teachers and Admins have that power."],
    ["What is the default Port for backend?", "Port 5000."],
    ["What is the default Port for frontend?", "Port 5173."],
    ["What is Mongoose?", "A tool that helps us talk to MongoDB easily."],
    ["What is Nodemon?", "A tool that restarts the server automatically when we save."],
    ["What is CORS?", "A security rule to allow frontend and backend to talk."],
    ["What is a Route?", "The path in the URL to find a specific page."],
    ["What are Props?", "Messages passed from parent components to child parts."],
    ["How do students get certificates?", "Only if they register AND the teacher marks them as Present."],
    ["What is the Database name?", "It is set in your MONGO_URI."],
    ["How do you handle images?", "We use Multer to save uploaded files."],
    ["What are the 4 user roles?", "Student, Faculty, Coordinator, and Admin."],
    ["What is a Single-Page App?", "An app like React that doesn't reload the whole page to change content."],
    ["What is a Hook?", "A special React function like useState or useEffect."],
    ["What was the hardest part?", "Making sure certificates only go to students who attended."]
];

questions.forEach((q, i) => {
    if (doc.y > 700) doc.addPage();
    doc.font('Times-Bold').fontSize(10).fillColor('#111827').text(`${i + 1}. Q: ${q[0]}`);
    doc.font('Times-Roman').fontSize(10).fillColor('#4B5563').text(`   A: ${q[1]}`);
    doc.moveDown(0.5);
});

doc.addPage();

title('7. Final Preparation Tips');
listItem('Keep your laptop charger ready.');
listItem('Open the website BEFORE the teacher arrives.');
listItem('Speak clearly and be confident.');
listItem('Know your 4 roles (Student, Teacher, Coordinator, Admin).');

doc.moveDown(3);
doc.font('Times-Italic').fontSize(10).fillColor('#9CA3AF').text('Generated by Event Sphere Assistant | Good Luck!', { align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
    console.log('PDF Generated Successfully at: ' + outputPath);
});

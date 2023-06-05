const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config();

// Import connection to the database
const sequelize = require('config\connection.js');

// create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: sequelize.process.env.DB_USER,
  password: sequelize.process.env.DB_PASSWORD,
  database: sequelize.process.env.DB_NAME,
});

// connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
  // start the application
  start();
});

// Function to load the main prompts
function loadMainPrompts() {
  inquirer.
    prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          {
            name: "View all employees",
            value: viewAllEmployees(),
          },
          {
            name: "Add employee",
            value: "/*function for option 2*/"
          },
          {
            name: "Update employee Role",
            value: "/*function for option 3*/"
          },
          {
            name: "View all roles",
            value: "/*function for option 4*/"
          },
          {
            name: "Add role",
            value: "/*function for option 5*/"
          },
          {
            name: "View all departments",
            value: "/*function for option 6*/"
          },
          {
            name: "Add department",
            value: "/*function for option 7*/"
          },
          {
            name: "Quit",
            value: "quit"
          }
        ]
      }
    ]).then(res => {
    let choice = res.choice;
    // Call the appropriate function depending on what the user chose
    switch (choice) {
      case "View all employees":
        // Function to view all employees
        function viewAllEmployees() {
          connection.query("SELECT * FROM employee", function (err, res) {
            if (err) throw err;
            console.table(res);
            loadMainPrompts();
          });
        }
        // Excecute the function
        
        break;
      case "Add employee":
        /*function for option 2*/;
        break;
      case "Update employee Role":
        /*function for option 3*/;
        break;
      case "View all roles":
        /*function for option 4*/;
        break;
      case "Add role":
        /*function for option 5*/;
        break;
      case "View all departments":
        /*function for option 6*/;
        break;
      case "Add department":
        /*function for option 7*/;
        break;
      default:
        // FUCNTION TO QUIT
        function quit() {
          connection.end();
          process.exit();
        }
        quit();
    }
  }
  )
}

loadMainPrompts();
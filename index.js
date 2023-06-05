const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config();

// create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
  // start the application
  start();
});

// Function to view all employees
function viewAllEmployees() {
  connection.query("SELECT id, first_name, last_name, role_id, manager_id FROM employee", function (err, res) {
    if (err) throw err;
    console.table(res);
    loadMainPrompts();
  });
}

// Function for adding a new employee when selection option 2
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "input",
        name: "role_id",
        message: "What is the employee's role ID?",
      },
      {
        type: "input",
        name: "manager_id",
        message: "What is the employee's manager ID?",
      },
    ])
    .then((res) => {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: res.first_name,
          last_name: res.last_name,
          role_id: res.role_id,
          manager_id: res.manager_id,
        },
        function (err, res) {
          if (err) throw err;
          console.log("Employee added!");
          loadMainPrompts();
        }
      );
    });
}

// Function to load the main prompts
function loadMainPrompts() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all employees",
          "Add employee",
          "Update employee Role",
          "View all roles",
          "Add role",
          "View all departments",
          "Add department",
          "Quit",
        ],
      },
    ])
    .then((res) => {
      let choice = res.action;
      // Call the appropriate function depending on what the user chose
      switch (choice) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Update employee Role":
          /*function for option 3*/ ;
          break;
        case "View all roles":
          /*function for option 4*/ ;
          break;
        case "Add role":
          /*function for option 5*/ ;
          break;
        case "View all departments":
          /*function for option 6*/ ;
          break;
        case "Add department":
          /*function for option 7*/ ;
          break;
        case "Quit":
          quit();
          break;
        default:
          console.log("Invalid choice.");
      }
    });
}

// Function to quit the application
function quit() {
  connection.end();
  process.exit();
}

// Function to start the application
function start() {
  loadMainPrompts();
}

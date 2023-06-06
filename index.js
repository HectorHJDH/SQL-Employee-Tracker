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

// OPTION 1 - Function to view all employees
function viewAllEmployees() {
  // Join another table to get the role title, department name, salary and manager name
  connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      loadMainPrompts();
    }
  );
}

// OPTION 2 - Function for adding a new employee
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

// Function for updating an employee's by selecting the employee first name appended to last name and then assing the employee to a department 
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "employee",
          message: "Which employee would you like to update?",
          choices: function () {
            let employeeArray = [];
            for (let i = 0; i < res.length; i++) {
              employeeArray.push(res[i].first_name + " " + res[i].last_name);
            }
            return employeeArray;
          },
        },
      ])
      .then((res) => {
        let employeeName = res.employee;
        connection.query("SELECT * FROM role", function (err, res) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: function () {
                  let roleArray = [];
                  for (let i = 0; i < res.length; i++) {
                    roleArray.push({
                      name: res[i].title,
                      value: res[i].id, // Use role ID as the value
                    });
                  }
                  return roleArray;
                },
              },
            ])
            .then((res) => {
              let newRoleId = res.role;
              connection.query(
                "UPDATE employee SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?",
                [newRoleId, employeeName],
                function (err, res) {
                  if (err) throw err;
                  console.log("Employee role updated!");
                  loadMainPrompts();
                }
              );
            });
        });
      });
  });
}



//Function for viewing id, title, department name and salary 
function viewAllRoles() {
  connection.query(
    "SELECT role.id, role.title, department.department_name, role.salary FROM role LEFT JOIN department ON role.department_id = department.id",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      loadMainPrompts();
    }
  );
}

// Function to view all department names
function viewAllDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    loadMainPrompts();
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
          updateEmployeeRole();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "Add role":
          /*function for option 5*/ ;
          break;
        case "View all departments":
          viewAllDepartments();
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

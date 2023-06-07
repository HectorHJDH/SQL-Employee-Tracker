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
      // Select the role name from the role table and use it as the value
      {
        type: "list",
        name: "role_id",
        message: "What is the employee's role?",
        choices: function () {
          return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM role", function (err, res) {
              if (err) {
                reject(err);
              } else {
                let roleArray = res.map((role) => ({
                  name: role.title,
                  value: role.id,
                }));
                resolve(roleArray);
              }
            });
          });
        }
      },
      // Select the manager name from the employee table and use it as the value
      {
        type: "list",
        name: "manager_id",
        message: "Who is the employee's manager?",
        choices: function () {
          return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM employee", function (err, res) {
              if (err) {
                reject(err);
              } else {
                let managerArray = res.map((employee) => ({
                  name: employee.first_name + " " + employee.last_name,
                  value: employee.id,
                }));
                resolve(managerArray);
              }
            });
          });
        }
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

// OPTION 3 - Function for updating an employee's by selecting the employee first name appended to last name and then assing the employee to a department 
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

// OPTION 4 - Function for viewing id, title, department name and salary 
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

// OPTION 5 - Function for adding a new role
function addRole() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM department", function (err, res) {
      if (err) {
        reject(err);
      } else {
        let departmentArray = res.map((department) => ({
          name: department.department_name,
          value: department.id,
        }));

        inquirer
          .prompt([
            {
              type: "input",
              name: "title",
              message: "What is the name of the role?",
            },
            {
              type: "input",
              name: "salary",
              message: "What is the salary of the role?",
            },
            {
              type: "list",
              name: "department_id",
              message: "Which department does the role belong to?",
              choices: departmentArray,
            },
          ])
          .then((res) => {
            connection.query(
              "INSERT INTO role SET ?",
              {
                title: res.title,
                salary: res.salary,
                department_id: res.department_id,
              },
              function (err, res) {
                if (err) {
                  reject(err);
                } else {
                  console.log("Role added!");
                  resolve();
                }
              }
            );
          });
      }
    });
  })
    .then(() => {
      loadMainPrompts();
    })
    .catch((error) => {
      console.error("Error adding role:", error);
      loadMainPrompts();
    });
}

// OPTION 6 - Function to view all department names
function viewAllDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    loadMainPrompts();
  });
}

// OPTION 7 - Function for adding a new department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department_name",
        message: "What is the name of the department?",
      },
    ])
    .then((res) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          department_name: res.department_name,
        },
        function (err, res) {
          if (err) throw err;
          console.log("Department added!");
          loadMainPrompts();
        }
      );
    });
}

// BONUS
// Function that updates employee managers
function updateEmployeeManager() {
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
        connection.query("SELECT * FROM employee", function (err, res) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                type: "list",
                name: "manager",
                message: "Who is the employee's new manager?",
                choices: function () {
                  let managerArray = [];
                  for (let i = 0; i < res.length; i++) {
                    managerArray.push({
                      name: res[i].first_name + " " + res[i].last_name,
                      value: res[i].id, // Use employee ID as the value
                    });
                  }
                  return managerArray;
                },
              },
            ])
            .then((res) => {
              let newManagerId = res.manager;
              connection.query(
                "UPDATE employee SET manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?",
                [newManagerId, employeeName],
                function (err, res) {
                  if (err) throw err;
                  console.log("Employee manager updated!");
                  loadMainPrompts();
                }
              );
            });
        });
      });
  });
}

// BONUS
// Function to view employees by manager
function viewEmployeesByManager() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "manager",
          message: "Which manager's employees would you like to view?",
          choices: function () {
            let managerArray = [];
            for (let i = 0; i < res.length; i++) {
              managerArray.push({
                name: res[i].first_name + " " + res[i].last_name,
                value: res[i].id, // Use employee ID as the value
              });
            }
            return managerArray;
          },
        },
      ])
      .then((res) => {
        let managerId = res.manager;
        connection.query(
          "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id WHERE employee.manager_id = ?",
          [managerId],
          function (err, res) {
            if (err) throw err;
            console.table(res);
            loadMainPrompts();
          }
        );
      });
  });
}

// BONUS - Function to view employees by department
function viewEmployeesByDepartment() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "list",
          name: "department",
          message: "Which department's employees would you like to view?",
          choices: function () {
            let departmentArray = [];
            for (let i = 0; i < res.length; i++) {
              departmentArray.push({
                name: res[i].department_name,
                value: res[i].id, // Use department ID as the value
              });
            }
            return departmentArray;
          },
        },
      ])
      .then((res) => {
        let departmentId = res.department;
        connection.query(
          "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department_name, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id WHERE department.id = ?",
          [departmentId],
          function (err, res) {
            if (err) throw err;
            console.table(res);
            loadMainPrompts();
          }
        );
      });
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
          "Bonus - Update employee managers",
          "Bonus - View employees by manager",
          "Bonus - View employees by department"
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
          addRole();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Bonus - Update employee managers":
          updateEmployeeManager();
          break;
        case "Bonus - View employees by manager":
          viewEmployeesByManager();
          break;
        case "Bonus - View employees by department":
          viewEmployeesByDepartment();
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

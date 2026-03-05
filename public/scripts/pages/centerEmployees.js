// pages/centerEmployees.js — CenterEmployees.html: client-side-only employee table management
// No API calls — purely DOM manipulation

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

function addEmployee(event) {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const role = document.getElementById('role').value;
    const salary = document.getElementById('salary').value;

    const tableBody = document.getElementById('employeeTableBody');
    const row = document.createElement('tr');

    const cellFirst = row.insertCell(0);
    cellFirst.textContent = firstName;
    const cellLast = row.insertCell(1);
    cellLast.textContent = lastName;
    const cellRole = row.insertCell(2);
    cellRole.textContent = role;
    const cellSalary = row.insertCell(3);
    cellSalary.textContent = salary;

    const cellActions = row.insertCell(4);
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn btn-outline btn-sm';
    deleteBtn.addEventListener('click', function () {
        this.closest('tr').remove();
    });
    cellActions.appendChild(deleteBtn);

    tableBody.appendChild(row);
    document.getElementById('employeeForm').reset();
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const employeeForm = document.getElementById('employeeForm');
if (employeeForm) {
    employeeForm.addEventListener('submit', addEmployee);
}

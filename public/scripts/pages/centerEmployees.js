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

    row.innerHTML = `
    <td>${firstName}</td>
    <td>${lastName}</td>
    <td>${role}</td>
    <td>${salary}</td>
    <td><button class="delete-employee-btn">Delete</button></td>
    `;

    // Attach delete handler via addEventListener instead of inline onclick
    // so that the module scope is respected.
    const deleteBtn = row.querySelector('.delete-employee-btn');
    deleteBtn.addEventListener('click', function () {
        this.closest('tr').remove();
    });

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

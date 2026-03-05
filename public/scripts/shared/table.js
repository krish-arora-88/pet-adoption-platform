// shared/table.js — reusable table-population helpers

/**
 * Populate a <tbody> (looked up via the *table* element id) from an
 * array-of-arrays.  Each inner array becomes one <tr>.
 *
 * @param {string} tableId - id of the <table> element (not the tbody)
 * @param {Array<Array>} data - rows, each row is an array of cell values
 */
export function populateTableFromArrays(tableId, data) {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) return;

    const tableBody = tableElement.querySelector('tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    data.forEach(rowData => {
        const row = tableBody.insertRow();
        rowData.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

/**
 * Populate a <tbody> (looked up directly by its own id) from an
 * array-of-objects with an explicit key order.
 *
 * @param {string} tbodyId - id of the <tbody> element
 * @param {Array<Object>} data - rows as plain objects
 * @param {Array<string>} keys - ordered property names to pull from each object
 */
export function populateTableFromObjects(tbodyId, data, keys) {
    const tableBody = document.getElementById(tbodyId);
    if (!tableBody) return;

    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = tableBody.insertRow();
        keys.forEach((key, index) => {
            const cell = row.insertCell(index);
            cell.textContent = item[key] ?? '';
        });
    });
}


let students = JSON.parse(localStorage.getItem("students")) || [];

const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");

let sortOrder = false;

// Theme Switching

const blueTheme = document.getElementById("blueTheme");
const greenTheme = document.getElementById("greenTheme");

function changeTheme(color) {

    if (color === "green") {
        document.body.classList.add("green-theme");

        greenTheme.classList.add("active");
        blueTheme.classList.remove("active");

        localStorage.setItem("selectedTheme", "green");

    } else {
        document.body.classList.remove("green-theme");

        blueTheme.classList.add("active");
        greenTheme.classList.remove("active");

        localStorage.setItem("selectedTheme", "blue");
    }
}

blueTheme.addEventListener("click", function() {
    changeTheme("blue");
});

greenTheme.addEventListener("click", function() {
    changeTheme("green");
});

const savedTheme = localStorage.getItem("selectedTheme") || "blue";
changeTheme(savedTheme);


// Form Validation

function validateForm() {

    const name = document.getElementById("studentName").value.trim();

    const registration = document.getElementById("registrationNumber").value.trim();

    const marks = [
        document.getElementById("programming").value,
        document.getElementById("mathematics").value,
        document.getElementById("english").value,
        document.getElementById("database").value,
        document.getElementById("networks").value
    ];

    if (name === "" || registration === "") {
        alert("Please enter student name and registration number.");
        return false;
    }

    if (marks.some(mark => mark === "")) {
        alert("Please enter marks for all five subjects.");
        return false;
    }

    for (let mark of marks) {
        if (!Number.isFinite(Number(mark)) ||
            Number(mark) < 0 || Number(mark) > 100) {

            alert("Marks must be between 0 and 100.");
            return false;
        }
    }

    const duplicate = students.some(student =>
        student.registration.toLowerCase() === registration.toLowerCase()
    );

    if (duplicate) {
        alert("This registration number already exists.");
        return false;
    }

    return true;
}


// Calculate Total Marks

function calculateTotal(marks) {

    return marks.reduce((total, mark) => total + mark, 0);

}


// Calculate Percentage

function calculatePercentage(total) {

    return (total / 500) * 100;

}


// Calculate Grade

function calculateGrade(percentage) {

    if (percentage >= 90) {
        return "A";
    } 
    else if (percentage >= 80) {
        return "B";
    } 
    else if (percentage >= 70) {
        return "C";
    } 
    else if (percentage >= 60) {
        return "D";
    } 
    else {
        return "F";
    }

}


// Check Pass or Fail

function checkStatus(marks) {

    for (let mark of marks) {

        if (mark < 40) {
            return "Fail";
        }

    }

    return "Pass";

}


// Add Student

function addStudent() {

    if (!validateForm()) {
        return;
    }

    const name = document.getElementById("studentName").value.trim();

    const registration = document.getElementById("registrationNumber").value.trim();

    const marks = [
        Number(document.getElementById("programming").value),
        Number(document.getElementById("mathematics").value),
        Number(document.getElementById("english").value),
        Number(document.getElementById("database").value),
        Number(document.getElementById("networks").value)
    ];

    const total = calculateTotal(marks);

    const percentage = calculatePercentage(total);

    const grade = calculateGrade(percentage);

    const status = checkStatus(marks);

    const student = {
        name,
        registration,
        marks,
        total,
        percentage,
        grade,
        status
    };

    students.push(student);

    saveStudents();

    displayStudents();

    updateDashboard();

    form.reset();

    alert("Student record added successfully!");

}


// Calculate Class Average

function calculateClassAverage() {

    if (students.length === 0) {
        return 0;
    }

    let totalPercentage = students.reduce(
        (sum, student) => sum + student.percentage, 0
    );

    return totalPercentage / students.length;

}


// Save Records in Local Storage

function saveStudents() {

    localStorage.setItem("students", JSON.stringify(students));

}


// Prevent HTML Injection

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}


// Display Student Records

function displayStudents() {

    const searchValue = document.getElementById("searchStudent")
        .value.trim().toLowerCase();

    studentTable.innerHTML = "";

    const filteredStudents = students.filter(student =>
        student.registration.toLowerCase().includes(searchValue)
    );

    if (filteredStudents.length === 0) {

        studentTable.innerHTML = `
            <tr>
                <td colspan="12" class="empty-message">
                    No student records available.
                </td>
            </tr>
        `;

        return;
    }

    filteredStudents.forEach(student => {

        const row = document.createElement("tr");

        const gradeClass = "grade-" + student.grade.toLowerCase();

        row.innerHTML = `
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.registration)}</td>
            <td>${student.marks[0]}</td>
            <td>${student.marks[1]}</td>
            <td>${student.marks[2]}</td>
            <td>${student.marks[3]}</td>
            <td>${student.marks[4]}</td>
            <td>${student.total}</td>
            <td>${student.percentage.toFixed(2)}%</td>
            <td>
                <span class="grade ${gradeClass}">
                    ${student.grade}
                </span>
            </td>
            <td>
                <span class="status ${student.status.toLowerCase()}">
                    ${student.status}
                </span>
            </td>
            <td>
                <button class="delete-btn"
                data-registration="${escapeHTML(student.registration)}">
                    Delete
                </button>
            </td>
        `;

        studentTable.appendChild(row);

    });

}


// Update Dashboard

function updateDashboard() {

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("classAverage").textContent =
        calculateClassAverage().toFixed(2) + "%";

    if (students.length === 0) {

        document.getElementById("topStudent").textContent = "---";

        document.getElementById("highestPercentage").textContent = "0%";

        return;
    }

    const topStudent = students.reduce((highest, student) =>
        student.percentage > highest.percentage ? student : highest
    );

    document.getElementById("topStudent").textContent =
        topStudent.name;

    document.getElementById("highestPercentage").textContent =
        topStudent.percentage.toFixed(2) + "%";

}


// Delete Student

function deleteStudent(registration) {

    if (confirm("Are you sure you want to delete this student?")) {

        students = students.filter(student =>
            student.registration !== registration
        );

        saveStudents();

        displayStudents();

        updateDashboard();

    }

}


// Sort Students by Percentage

function sortStudents() {

    sortOrder = !sortOrder;

    students.sort((a, b) => {

        return sortOrder
            ? a.percentage - b.percentage
            : b.percentage - a.percentage;

    });

    saveStudents();

    displayStudents();

}


// Clear All Student Records

function clearAllStudents() {

    if (students.length === 0) {
        alert("There are no student records to clear.");
        return;
    }

    if (confirm("Are you sure you want to delete all student records?")) {

        students = [];

        saveStudents();

        displayStudents();

        updateDashboard();

    }

}


// Form Submit Event

form.addEventListener("submit", function(event) {

    event.preventDefault();

    addStudent();

});


// Search Student

document.getElementById("searchStudent").addEventListener(
    "input", displayStudents
);


// Sort Button

document.getElementById("sortBtn").addEventListener(
    "click", sortStudents
);


// Clear All Button

document.getElementById("clearBtn").addEventListener(
    "click", clearAllStudents
);


// Delete Button Event

studentTable.addEventListener("click", function(event) {

    if (event.target.classList.contains("delete-btn")) {

        deleteStudent(event.target.dataset.registration);

    }

});


// Load Records When Page Opens

displayStudents();

updateDashboard();

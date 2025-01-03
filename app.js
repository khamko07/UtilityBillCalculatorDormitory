document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("utilityForm");
  const addPersonButton = document.getElementById("addPerson");
  const personList = document.getElementById("personList");
  const resultsDiv = document.getElementById("results");
  const darkModeToggle = document.querySelector(".dark-mode-toggle");

  // Load saved data
  loadSavedData();

  // Add person
  addPersonButton.addEventListener("click", addPerson);

  // Remove person
  personList.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-person")) {
      e.target.closest(".person-item").remove();
    }
  });

  // Calculate
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculateCosts();
  });

  // Dark mode toggle
  darkModeToggle.addEventListener("click", toggleDarkMode);

  const printInvoiceButton = document.getElementById("printInvoice");
  const invoiceModal = document.getElementById("invoiceModal");
  const closeModal = document.querySelector(".close");
  const printButton = document.getElementById("printButton");

  printInvoiceButton.addEventListener("click", showInvoice);
  closeModal.addEventListener("click", () => invoiceModal.style.display = "none");
  printButton.addEventListener("click", () => window.print());

  window.addEventListener("click", function (event) {
    if (event.target == invoiceModal) {
      invoiceModal.style.display = "none";
    }
  });

  function addPerson() {
    const personItem = document.createElement("div");
    personItem.classList.add("person-item");
    personItem.innerHTML = `
            <input type="text" class="person-name" placeholder="Tên người" required>
            <input type="number" class="person-days" placeholder="Số ngày ở" required>
            <button type="button" class="remove-person" title="Xóa người này">&times;</button>
        `;
    personList.appendChild(personItem);
  }

  function calculateCosts() {
    const totalCost = parseFloat(document.getElementById("totalCost").value);
    const people = document.querySelectorAll(".person-item");
    let totalDays = 0;
    const personData = [];

    people.forEach((person) => {
      const name = person.querySelector(".person-name").value;
      const days = parseInt(person.querySelector(".person-days").value);
      if (name && !isNaN(days)) {
        totalDays += days;
        personData.push({ name, days });
      }
    });

    if (isNaN(totalCost) || totalDays === 0) {
      showError("Vui lòng nhập đầy đủ thông tin hợp lệ.");
      return;
    }

    const results = personData.map((person) => {
      const cost = (person.days / totalDays) * totalCost;
      return `<div class="result-item">
                <span>${person.name}</span>
                <span>${cost.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}</span>
            </div>`;
    });

    resultsDiv.innerHTML = results.join("");
    resultsDiv.classList.add("show");

    // Save data
    saveData();
  }

  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.classList.add("error");
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, resultsDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  function saveData() {
    const data = {
      totalCost: document.getElementById("totalCost").value,
      people: Array.from(document.querySelectorAll(".person-item")).map(
        (person) => ({
          name: person.querySelector(".person-name").value,
          days: person.querySelector(".person-days").value,
        })
      ),
    };
    localStorage.setItem("utilityCalculatorData", JSON.stringify(data));
  }

  function loadSavedData() {
    const savedData = localStorage.getItem("utilityCalculatorData");
    if (savedData) {
      const data = JSON.parse(savedData);
      document.getElementById("totalCost").value = data.totalCost;
      data.people.forEach((person) => {
        const personItem = document.createElement("div");
        personItem.classList.add("person-item");
        personItem.innerHTML = `
                    <input type="text" class="person-name" value="${person.name}" required>
                    <input type="number" class="person-days" value="${person.days}" required>
                    <button type="button" class="remove-person" title="Xóa người này">&times;</button>
                `;
        personList.appendChild(personItem);
      });
    }
  }

  function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const icon = darkModeToggle.querySelector("i");
    if (document.body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  }

  function showInvoice() {
    const totalCost = parseFloat(document.getElementById("totalCost").value);
    const people = document.querySelectorAll(".person-item");
    let totalDays = 0;
    const personData = [];

    people.forEach((person) => {
        const name = person.querySelector(".person-name").value;
        const days = parseInt(person.querySelector(".person-days").value);
        if (name && !isNaN(days)) {
            totalDays += days;
            personData.push({ name, days });
        }
    });

    if (isNaN(totalCost) || totalDays === 0) {
        showError("Vui lòng nhập đầy đủ thông tin hợp lệ.");
        return;
    }

    const invoiceContent = document.getElementById("invoiceContent");
    const date = new Date().toLocaleDateString("vi-VN");
    const invoiceId = `HD${Date.now()}`;

    let invoiceHTML = `
        <h2>Hóa Đơn Tính Tiền Điện Nước</h2>
        <p>Ngày lập hóa đơn: ${date}</p>
        <table>
            <thead>
                <tr>
                    <th>Tên người sử dụng</th>
                    <th>Số ngày ở</th>
                    <th>Chi phí tương ứng (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
    `;

    personData.forEach((person) => {
        const cost = (person.days / totalDays) * totalCost;
        invoiceHTML += `
            <tr>
                <td>${person.name}</td>
                <td>${person.days}</td>
                <td>${cost.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                })}</td>
            </tr>
        `;
    });

    invoiceHTML += `
            </tbody>
        </table>
        <p>Tổng chi phí điện nước: ${totalCost.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        })}</p>
    `;

    invoiceContent.innerHTML = invoiceHTML;
    invoiceModal.style.display = "block";
  }
});

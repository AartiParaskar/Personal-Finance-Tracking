let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = localStorage.getItem("budget") || 0;
let editId = null;

function save() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addOrUpdateExpense() {
  const title = document.getElementById("title").value;
  const amount = +document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!title || !amount || !date) return alert("Fill all fields");

  if (editId) {
    let exp = expenses.find(e => e.id === editId);
    exp.title = title;
    exp.amount = amount;
    exp.category = category;
    exp.date = date;
    editId = null;
  } else {
    expenses.push({ id: Date.now(), title, amount, category, date });
  }

  save();
  renderExpenses();
  clearForm();
}

function editExpense(id) {
  const e = expenses.find(e => e.id === id);

  document.getElementById("title").value = e.title;
  document.getElementById("amount").value = e.amount;
  document.getElementById("category").value = e.category;
  document.getElementById("date").value = e.date;

  editId = id;
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  renderExpenses();
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  const search = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter").value;
  const month = document.getElementById("monthFilter").value;

  let filtered = expenses.filter(e => {
    return (
      e.title.toLowerCase().includes(search) &&
      (filter === "All" || e.category === filter) &&
      (!month || e.date.startsWith(month))
    );
  });

  filtered.forEach(e => {
    const li = document.createElement("li");
    li.className = "bg-white p-3 rounded shadow flex justify-between";

    li.innerHTML = `
      <div>
        <strong>${e.title}</strong> - ₹${e.amount} (${e.category})
        <br><small>${e.date}</small>
      </div>
      <div class="space-x-2">
        <button onclick="editExpense(${e.id})" class="bg-yellow-400 px-2 py-1 rounded">✏️</button>
        <button onclick="deleteExpense(${e.id})" class="bg-red-500 text-white px-2 py-1 rounded">❌</button>
      </div>
    `;

    list.appendChild(li);

    // Animation
    gsap.from(li, { opacity: 0, y: 20, duration: 0.3 });
  });

  updateSummary();
  drawChart(filtered);
}

function updateSummary() {
  let total = expenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("total").innerText = total;
  document.getElementById("budget").innerText = budget;
  document.getElementById("remaining").innerText = budget - total;
}

function setBudget() {
  budget = document.getElementById("budgetInput").value;
  localStorage.setItem("budget", budget);
  updateSummary();
}

let chart;
function drawChart(data) {
  const ctx = document.getElementById("chart");

  let categories = {};
  data.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories)
      }]
    }
  });
}

document.getElementById("darkModeToggle").onclick = () => {
  document.body.classList.toggle("bg-gray-900");
  document.body.classList.toggle("text-white");
};

renderExpenses();


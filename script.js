// Initialize data from localStorage or set defaults
let budget = parseFloat(localStorage.getItem('budget')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Category colors for the pie chart
const categoryColors = {
    food: '#FF6B6B',
    transportation: '#4ECDC4',
    utilities: '#45B7D1',
    entertainment: '#96CEB4',
    other: '#FFEEAD'
};

// Format number to Indian currency format
function formatIndianCurrency(number) {
    const formatter = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
    });
    return formatter.format(number);
}

// Update UI with stored data
function updateUI() {
    document.getElementById('currentBudget').textContent = formatIndianCurrency(budget);
    
    const total = calculateTotal();
    document.getElementById('totalExpenses').textContent = formatIndianCurrency(total);
    
    // Update progress bar
    const percentage = (total / budget) * 100;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = budget > 0 ? `${Math.min(percentage, 100)}%` : '0%';
    
    // Update progress bar color based on percentage
    if (percentage >= 80) {
        progressFill.className = 'progress-fill danger';
        showAlert();
    } else if (percentage >= 60) {
        progressFill.className = 'progress-fill warning';
    } else {
        progressFill.className = 'progress-fill';
    }

    renderExpensesList();
    updatePieChart();
}

// Calculate total expenses
function calculateTotal() {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

// Show budget alert
function showAlert() {
    const total = calculateTotal();
    if (total >= budget * 0.8) {
        alert(`Warning: You have used ${((total / budget) * 100).toFixed(1)}% of your budget!`);
    }
}

// Render expenses list
function renderExpensesList() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';

    expenses.forEach((expense, index) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div>
                <strong>${expense.title}</strong>
                <span>(${expense.category})</span>
            </div>
            <div>
                <span>₹${formatIndianCurrency(expense.amount)}</span>
                <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
            </div>
        `;
        expensesList.appendChild(expenseElement);
    });
}

// Update pie chart
function updatePieChart() {
    const categoryTotals = {};
    let total = 0;

    // Calculate totals per category
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        total += expense.amount;
    });

    const pieChart = document.getElementById('pieChart');
    const legend = document.getElementById('chartLegend');
    legend.innerHTML = '';

    if (total === 0) {
        pieChart.style.background = '#ddd';
        return;
    }

    // Generate conic gradient
    const gradientParts = [];
    let currentPercentage = 0;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        
        // Add to gradient
        gradientParts.push(`${categoryColors[category]} ${currentPercentage}% ${currentPercentage + percentage}%`);
        
        // Add legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${categoryColors[category]}"></div>
            <div>${category.charAt(0).toUpperCase() + category.slice(1)}: ₹${formatIndianCurrency(amount)} (${percentage.toFixed(1)}%)</div>
        `;
        legend.appendChild(legendItem);

        currentPercentage += percentage;
    });

    // Apply the gradient
    pieChart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}

// Delete expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
}

// Event Listeners
document.getElementById('budgetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    budget = parseFloat(document.getElementById('budget').value);
    localStorage.setItem('budget', budget);
    updateUI();
    e.target.reset();
});

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newExpense = {
        title: document.getElementById('expenseTitle').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        date: new Date().toISOString()
    };
    
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
    e.target.reset();
});

// Initial UI update
updateUI();
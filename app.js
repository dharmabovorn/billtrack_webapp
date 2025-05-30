// This file contains the BillTrackerApp class definition

class BillTrackerApp {
    constructor() {
        this.bills = [];
        this.monthlyIncome = 0;
        this.editingBillId = null;
        this.categories = [
            'Housing',
            'Utilities',
            'Food',
            'Transportation',
            'Healthcare',
            'Entertainment',
            'Other'
        ];
        
        // DOM Elements
        this.billsList = document.getElementById('billsList');
        this.noBillsMessage = document.getElementById('noBillsMessage');
        this.monthlyIncomeEl = document.getElementById('monthlyIncome');
        this.totalExpensesEl = document.getElementById('totalExpenses');
        this.remainingBalanceEl = document.getElementById('remainingBalance');
        
        // Modal elements
        this.billModal = new bootstrap.Modal(document.getElementById('billModal'));
        this.incomeModal = new bootstrap.Modal(document.getElementById('incomeModal'));
        this.categoriesModal = new bootstrap.Modal(document.getElementById('categoriesModal'));
        
        // Form elements
        this.billForm = document.getElementById('billForm');
        this.billIdInput = document.getElementById('billId');
        this.billNameInput = document.getElementById('billName');
        this.billAmountInput = document.getElementById('billAmount');
        this.billDueDateInput = document.getElementById('billDueDate');
        this.billCategoryInput = document.getElementById('billCategory');
        this.billIsPaidInput = document.getElementById('billIsPaid');
        this.monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
        
        // Category management elements
        this.newCategoryGroup = document.getElementById('newCategoryGroup');
        this.newCategoryInput = document.getElementById('newCategoryInput');
        this.categoriesList = document.getElementById('categoriesList');
        this.addCategoryInput = document.getElementById('addCategoryInput');
        
        // Set default due date to today
        const today = new Date().toISOString().split('T')[0];
        this.billDueDateInput.value = today;
        this.billDueDateInput.min = today;
    }
    
    init() {
        // Load data from localStorage
        this.loadData();
        
        // Initialize the categories dropdown
        this.updateCategoryDropdown();
        
        // Render the bills
        this.renderBills();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add Bill button
        document.getElementById('addBillBtn').addEventListener('click', () => this.showAddBillModal());
        
        // Edit Income button
        document.getElementById('editIncomeBtn').addEventListener('click', () => this.showEditIncomeModal());
        
        // Save Bill button
        document.getElementById('saveBillBtn').addEventListener('click', () => this.saveBill());
        
        // Save Income button
        document.getElementById('saveIncomeBtn').addEventListener('click', () => this.saveIncome());
        
        // Export buttons
        document.getElementById('exportPdf').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToPdf();
        });
        
        document.getElementById('exportCsv').addEventListener('click', (e) => {
            e.preventDefault();
            this.exportToCsv();
        });
        
        // Category management
        document.getElementById('manageCategoriesBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCategoriesModal();
        });
        
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showNewCategoryInput();
        });
        
        document.getElementById('saveNewCategoryBtn').addEventListener('click', () => {
            this.addNewCategory(this.newCategoryInput.value);
        });
        
        document.getElementById('cancelNewCategoryBtn').addEventListener('click', () => {
            this.hideNewCategoryInput();
        });
        
        document.getElementById('addCategoryModalBtn').addEventListener('click', () => {
            this.addNewCategory(this.addCategoryInput.value, true);
        });
        
        // Handle Enter key in category input
        this.newCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewCategory(this.newCategoryInput.value);
            }
        });
        
        this.addCategoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addNewCategory(this.addCategoryInput.value, true);
            }
        });
        
        // Form submission
        this.billForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBill();
        });
    }
    
    loadData() {
        // Load bills from localStorage
        const savedBills = localStorage.getItem('bills');
        if (savedBills) {
            this.bills = JSON.parse(savedBills);
        }
        
        // Load monthly income from localStorage
        const savedIncome = localStorage.getItem('monthlyIncome');
        if (savedIncome) {
            this.monthlyIncome = parseFloat(savedIncome);
            this.monthlyIncomeEl.textContent = this.formatCurrency(this.monthlyIncome);
        }
        
        // Load categories from localStorage
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
        
        // Update the UI
        this.updateSummary();
    }
    
    saveData() {
        // Save bills to localStorage
        localStorage.setItem('bills', JSON.stringify(this.bills));
        
        // Save monthly income to localStorage
        localStorage.setItem('monthlyIncome', this.monthlyIncome.toString());
        
        // Save categories to localStorage
        localStorage.setItem('categories', JSON.stringify(this.categories));
        
        // Update the UI
        this.updateSummary();
        
        // Update the categories dropdown
        this.updateCategoryDropdown();
        
        // Update the categories list in the modal
        this.renderCategoriesList();
    }
    
    renderBills() {
        // Clear the current list
        this.billsList.innerHTML = '';
        
        if (this.bills.length === 0) {
            this.noBillsMessage.style.display = 'block';
            return;
        }
        
        this.noBillsMessage.style.display = 'none';
        
        // Sort bills by due date (earliest first)
        const sortedBills = [...this.bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // Add each bill to the list
        sortedBills.forEach(bill => {
            const billEl = this.createBillElement(bill);
            this.billsList.appendChild(billEl);
        });
    }
    
    createBillElement(bill) {
        const today = new Date();
        const dueDate = new Date(bill.dueDate);
        const isOverdue = !bill.isPaid && dueDate < today && dueDate.toDateString() !== today.toDateString();
        
        const billEl = document.createElement('div');
        billEl.className = `list-group-item bill-item ${bill.isPaid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''}`;
        billEl.setAttribute('data-id', bill.id);
        
        const formattedDate = new Date(bill.dueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        billEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-center w-100">
                <div class="bill-info">
                    <div class="d-flex align-items-center">
                        <h6 class="bill-name mb-0 me-2">${bill.name}</h6>
                        <span class="badge bg-${bill.isPaid ? 'success' : 'secondary'} text-uppercase" style="font-size: 0.6rem;">${bill.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div class="d-flex align-items-center mt-1">
                        <span class="text-muted small me-2">${formattedDate}</span>
                        <span class="badge bg-light text-dark">${bill.category}</span>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <div class="me-3 text-end">
                        <div class="bill-amount">$${bill.amount.toFixed(2)}</div>
                        ${isOverdue ? '<small class="text-danger">Overdue</small>' : ''}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary edit-bill" data-id="${bill.id}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-bill" data-id="${bill.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the buttons
        billEl.querySelector('.edit-bill').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editBill(bill.id);
        });
        
        billEl.querySelector('.delete-bill').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this bill?')) {
                this.deleteBill(bill.id);
            }
        });
        
        // Toggle paid status when clicking on the bill
        billEl.addEventListener('click', () => {
            this.toggleBillPaidStatus(bill.id);
        });
        
        return billEl;
    }
    
    showAddBillModal() {
        this.editingBillId = null;
        this.billForm.reset();
        this.billIdInput.value = '';
        this.billNameInput.value = '';
        this.billAmountInput.value = '';
        this.billDueDateInput.value = new Date().toISOString().split('T')[0];
        this.billCategoryInput.value = 'Other';
        this.billIsPaidInput.checked = false;
        
        document.getElementById('modalTitle').textContent = 'Add New Bill';
        this.billModal.show();
    }
    
    showEditBillModal(bill) {
        this.editingBillId = bill.id;
        this.billIdInput.value = bill.id;
        this.billNameInput.value = bill.name;
        this.billAmountInput.value = bill.amount;
        this.billDueDateInput.value = bill.dueDate;
        this.billCategoryInput.value = bill.category;
        this.billIsPaidInput.checked = bill.isPaid;
        
        document.getElementById('modalTitle').textContent = 'Edit Bill';
        this.billModal.show();
    }
    
    showEditIncomeModal() {
        this.monthlyIncomeInput.value = this.monthlyIncome || '';
        this.incomeModal.show();
    }
    
    saveBill() {
        const name = this.billNameInput.value.trim();
        const amount = parseFloat(this.billAmountInput.value);
        const dueDate = this.billDueDateInput.value;
        const category = this.billCategoryInput.value;
        const isPaid = this.billIsPaidInput.checked;
        
        if (!name || isNaN(amount) || !dueDate || !category) {
            this.showToast('Error', 'Please fill in all required fields.', 'danger');
            return;
        }
        
        // If category doesn't exist, add it to the list
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            this.saveData();
        }
        
        const billData = {
            id: this.editingBillId || Date.now().toString(),
            name,
            amount,
            dueDate,
            category,
            isPaid
        };
        
        if (this.editingBillId) {
            // Update existing bill
            const index = this.bills.findIndex(b => b.id === this.editingBillId);
            if (index !== -1) {
                this.bills[index] = billData;
                this.showToast('Success', 'Bill updated successfully!', 'success');
            }
        } else {
            // Add new bill
            this.bills.push(billData);
            this.showToast('Success', 'Bill added successfully!', 'success');
        }
        
        // Save and update UI
        this.saveData();
        this.renderBills();
        this.billModal.hide();
    }
    
    saveIncome() {
        const income = parseFloat(this.monthlyIncomeInput.value);
        
        if (isNaN(income) || income < 0) {
            this.showToast('Error', 'Please enter a valid income amount.', 'danger');
            return;
        }
        
        this.monthlyIncome = income;
        this.saveData();
        this.incomeModal.hide();
        this.showToast('Success', 'Monthly income updated!', 'success');
    }
    
    editBill(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill) {
            this.showEditBillModal(bill);
        }
    }
    
    deleteBill(billId) {
        this.bills = this.bills.filter(bill => bill.id !== billId);
        this.saveData();
        this.renderBills();
        this.showToast('Deleted', 'Bill has been removed.', 'info');
    }
    
    toggleBillPaidStatus(billId) {
        const bill = this.bills.find(b => b.id === billId);
        if (bill) {
            bill.isPaid = !bill.isPaid;
            this.saveData();
            this.renderBills();
            this.showToast('Updated', `Bill marked as ${bill.isPaid ? 'paid' : 'unpaid'}.`, 'success');
        }
    }
    
    updateSummary() {
        // Calculate total expenses (only paid bills)
        const totalExpenses = this.bills
            .filter(bill => bill.isPaid)
            .reduce((total, bill) => total + bill.amount, 0);
        
        // Update UI
        this.monthlyIncomeEl.textContent = this.formatCurrency(this.monthlyIncome);
        this.totalExpensesEl.textContent = this.formatCurrency(totalExpenses);
        
        const remainingBalance = this.monthlyIncome - totalExpenses;
        this.remainingBalanceEl.textContent = this.formatCurrency(remainingBalance);
        this.remainingBalanceEl.className = `h5 mb-0 ${remainingBalance >= 0 ? 'text-success' : 'text-danger'}`;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    showToast(title, message, type = 'info') {
        // Create toast element
        const toastId = `toast-${Date.now()}`;
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        toastEl.id = toastId;
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to container
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        container.appendChild(toastEl);
        
        // Initialize and show the toast
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 3000
        });
        toast.show();
        
        // Remove the toast from DOM after it's hidden
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
    
    exportToPdf() {
        // In a real app, you would use jsPDF to generate a PDF
        // This is a simplified version that just shows a message
        this.showToast('Export', 'PDF export would be generated here.', 'info');
        
        // Example of how you might implement PDF export with jsPDF
        /*
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text('Bill Tracker - Monthly Report', 20, 20);
        doc.text(`Monthly Income: $${this.monthlyIncome.toFixed(2)}`, 20, 30);
        doc.text(`Total Expenses: $${this.bills
            .filter(bill => bill.isPaid)
            .reduce((total, bill) => total + bill.amount, 0)
            .toFixed(2)}`, 20, 40);
        
        // Add table of bills
        const headers = [['Name', 'Amount', 'Due Date', 'Category', 'Status']];
        const data = this.bills.map(bill => [
            bill.name,
            `$${bill.amount.toFixed(2)}`,
            new Date(bill.dueDate).toLocaleDateString(),
            bill.category,
            bill.isPaid ? 'Paid' : 'Unpaid'
        ]);
        
        doc.autoTable({
            head: headers,
            body: data,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 10 },
            margin: { top: 50 }
        });
        
        doc.save(`bill-tracker-${new Date().toISOString().split('T')[0]}.pdf`);
        */
    }
    
    exportToCsv() {
        // Create CSV content
        let csvContent = 'Name,Amount,Due Date,Category,Status\n';
        
        this.bills.forEach(bill => {
            const row = [
                `"${bill.name.replace(/"/g, '""')}"`,
                bill.amount.toFixed(2),
                new Date(bill.dueDate).toISOString().split('T')[0],
                `"${bill.category}"`,
                bill.isPaid ? 'Paid' : 'Unpaid'
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bill-tracker-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Exported', 'CSV file downloaded successfully!', 'success');
    }
    
    updateCategoryDropdown() {
        const select = this.billCategoryInput;
        select.innerHTML = '';
        
        // Sort categories alphabetically
        const sortedCategories = [...this.categories].sort();
        
        // Add each category as an option
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }
    
    showNewCategoryInput() {
        this.newCategoryGroup.classList.remove('d-none');
        this.newCategoryInput.focus();
    }
    
    hideNewCategoryInput() {
        this.newCategoryGroup.classList.add('d-none');
        this.newCategoryInput.value = '';
    }
    
    addNewCategory(categoryName, fromModal = false) {
        const name = categoryName.trim();
        
        if (!name) {
            this.showToast('Error', 'Please enter a category name.', 'danger');
            return;
        }
        
        if (this.categories.includes(name)) {
            this.showToast('Error', 'This category already exists.', 'warning');
            return;
        }
        
        // Add the new category
        this.categories.push(name);
        this.saveData();
        
        // Update the selected category
        this.billCategoryInput.value = name;
        
        // Clear and hide the input
        if (fromModal) {
            this.addCategoryInput.value = '';
            this.addCategoryInput.focus();
        } else {
            this.hideNewCategoryInput();
        }
        
        this.showToast('Success', 'Category added successfully!', 'success');
    }
    
    showCategoriesModal() {
        this.renderCategoriesList();
        this.categoriesModal.show();
    }
    
    renderCategoriesList() {
        const container = this.categoriesList;
        container.innerHTML = '';
        
        if (this.categories.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">No categories yet. Add one above!</div>';
            return;
        }
        
        // Sort categories alphabetically
        const sortedCategories = [...this.categories].sort();
        
        // Add each category to the list
        sortedCategories.forEach((category, index) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            
            // Count how many bills use this category
            const billCount = this.bills.filter(bill => bill.category === category).length;
            
            item.innerHTML = `
                <span class="category-badge">${category}</span>
                <div>
                    <span class="badge bg-light text-dark me-2">${billCount} ${billCount === 1 ? 'bill' : 'bills'}</span>
                    <button class="btn btn-sm btn-outline-danger delete-category" data-category="${category}" ${billCount > 0 ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            // Add delete button event listener
            const deleteBtn = item.querySelector('.delete-category');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCategory(category);
                });
            }
            
            container.appendChild(item);
        });
    }
    
    deleteCategory(category) {
        if (confirm(`Are you sure you want to delete the category "${category}"? This cannot be undone.`)) {
            // Remove the category from the list
            this.categories = this.categories.filter(cat => cat !== category);
            
            // Update any bills that were using this category
            this.bills = this.bills.map(bill => {
                if (bill.category === category) {
                    return { ...bill, category: 'Other' };
                }
                return bill;
            });
            
            this.saveData();
            this.showToast('Deleted', `Category "${category}" has been removed.`, 'info');
        }
    }
    
    // Helper function to format dates
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// The initialization code is now in index.html to ensure proper loading order

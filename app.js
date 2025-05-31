// This file contains the BillTrackerApp class definition

class BillTrackerApp {
    constructor() {
        this.bills = [];
        this.notes = [];
        this.monthlyIncome = 0;
        this.editingBillId = null;
        this.editingNoteId = null;
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
        this.notesList = document.getElementById('notesList');
        this.noBillsMessage = document.getElementById('noBillsMessage');
        this.noNotesMessage = document.getElementById('noNotesMessage');
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
        
        // Render notes
        this.renderNotes();
    }
    
    setupEventListeners() {
        // Add Bill button
        document.getElementById('addBillBtn').addEventListener('click', () => this.showAddBillModal());
        
        // Add Note button
        document.getElementById('addNoteBtn').addEventListener('click', () => this.showAddNoteModal());
        
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
        
        // Load notes from localStorage
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
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
        
        // Save notes to localStorage
        localStorage.setItem('notes', JSON.stringify(this.notes));
        
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
        
        // Update notes display
        this.renderNotes();
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
        // Calculate total expenses (all bills, both paid and unpaid)
        const totalExpenses = this.bills
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
        try {
            // Get current month and year
            const now = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June",
                              "July", "August", "September", "October", "November", "December"];
            const currentMonth = monthNames[now.getMonth()];
            const currentYear = now.getFullYear();
            
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title with month and year
            doc.setFontSize(18);
            doc.text(`Bill Tracker - ${currentMonth} ${currentYear}`, 14, 22);
            
            // Add report generated date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Report generated on: ${now.toLocaleDateString()}`, 14, 30);
            
            // Add summary section
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary', 14, 45);
            
            // Add summary data
            doc.setFontSize(11);
            doc.text(`Monthly Income: ${this.formatCurrency(this.monthlyIncome)}`, 20, 55);
            
            const totalExpenses = this.bills.reduce((total, bill) => total + bill.amount, 0);
            doc.text(`Total Expenses: ${this.formatCurrency(totalExpenses)}`, 20, 63);
            
            const remainingBalance = this.monthlyIncome - totalExpenses;
            doc.text(`Remaining Balance: ${this.formatCurrency(remainingBalance)}`, 20, 71);
            
            // Add bills table
            doc.setFontSize(14);
            doc.text('Bills', 14, 90);
            
            // Prepare table data
            const headers = [['Name', 'Amount', 'Due Date', 'Category', 'Status']];
            const data = this.bills.map(bill => ({
                name: bill.name,
                amount: this.formatCurrency(bill.amount),
                dueDate: new Date(bill.dueDate).toLocaleDateString(),
                category: bill.category,
                status: bill.isPaid ? 'Paid' : 'Unpaid'
            }));
            
            // Convert data to array of arrays for the table
            const tableData = data.map(bill => [
                bill.name,
                bill.amount,
                bill.dueDate,
                bill.category,
                bill.status
            ]);
            
            // Add the table
            doc.autoTable({
                head: headers,
                body: tableData,
                startY: 100,
                theme: 'grid',
                headStyles: { 
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: { 
                    fontSize: 10,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    lineWidth: 0.1,
                    lineColor: 200
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto', halign: 'right' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 'auto' },
                    4: { cellWidth: 'auto', halign: 'center' }
                },
                margin: { top: 5 },
                didDrawPage: function(data) {
                    // Footer
                    const pageSize = doc.internal.pageSize;
                    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                    doc.text(
                        `Page ${data.pageCount}`, 
                        data.settings.margin.left, 
                        pageHeight - 10
                    );
                }
            });
            
            // Save the PDF
            doc.save(`bill-tracker-${currentMonth}-${currentYear}.pdf`);
            this.showToast('Success', 'PDF exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('Error', 'Failed to generate PDF. Please try again.', 'danger');
        }
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
    
    // Notes functionality
    showAddNoteModal(note = null) {
        this.editingNoteId = note ? note.id : null;
        
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('noteModal')) {
            const modalHTML = `
                <div class="modal fade" id="noteModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">${note ? 'Edit Note' : 'Add New Note'}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="noteTitle" class="form-label">Title</label>
                                    <input type="text" class="form-control" id="noteTitle" value="${note ? note.title : ''}">
                                </div>
                                <div class="mb-3">
                                    <label for="noteContent" class="form-label">Content</label>
                                    <textarea class="form-control" id="noteContent" rows="5">${note ? note.content : ''}</textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveNoteBtn">Save Note</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add event listener for save button
            document.getElementById('saveNoteBtn').addEventListener('click', () => this.saveNote());
        } else {
            // Update existing modal
            document.querySelector('#noteModal .modal-title').textContent = note ? 'Edit Note' : 'Add New Note';
            document.getElementById('noteTitle').value = note ? note.title : '';
            document.getElementById('noteContent').value = note ? note.content : '';
        }
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('noteModal'));
        modal.show();
    }
    
    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        
        if (!title || !content) {
            this.showToast('Error', 'Please fill in both title and content', 'danger');
            return;
        }
        
        const noteData = {
            id: this.editingNoteId || Date.now().toString(),
            title,
            content,
            createdAt: this.editingNoteId ? 
                (this.notes.find(n => n.id === this.editingNoteId)?.createdAt || new Date().toISOString()) : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (this.editingNoteId) {
            // Update existing note
            const index = this.notes.findIndex(n => n.id === this.editingNoteId);
            if (index !== -1) {
                this.notes[index] = noteData;
                this.showToast('Success', 'Note updated successfully!', 'success');
            }
        } else {
            // Add new note
            this.notes.unshift(noteData);
            this.showToast('Success', 'Note added successfully!', 'success');
        }
        
        // Save and update UI
        this.saveData();
        
        // Hide the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('noteModal'));
        modal.hide();
    }
    
    renderNotes() {
        if (!this.notesList) return;
        
        this.notesList.innerHTML = '';
        
        if (this.notes.length === 0) {
            this.notesList.innerHTML = `
                <div class="text-muted text-center py-3" id="noNotesMessage">
                    <i class="bi bi-journal-text d-block mb-2" style="font-size: 2rem; opacity: 0.5;"></i>
                    No notes yet. Click "Add Note" to get started.
                </div>`;
            return;
        }
        
        // Sort notes by last updated (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        sortedNotes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note-card';
            
            // Format the date
            const updatedAt = new Date(note.updatedAt);
            const formattedDate = updatedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            noteEl.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title">${this.escapeHtml(note.title)}</h5>
                        <div class="dropdown note-actions">
                            <button class="btn btn-sm btn-outline-secondary rounded-circle" type="button" 
                                data-bs-toggle="dropdown" aria-expanded="false"
                                aria-label="Note actions">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item edit-note" href="#" data-id="${note.id}">
                                        <i class="bi bi-pencil me-2"></i>Edit
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger delete-note" href="#" data-id="${note.id}">
                                        <i class="bi bi-trash me-2"></i>Delete
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-text">${this.escapeHtml(note.content).replace(/\n/g, '<br>')}</div>
                </div>
                <div class="card-footer">
                    <small class="note-date">
                        <i class="bi bi-clock me-1"></i>Updated ${formattedDate}
                    </small>
                </div>`;
            
            this.notesList.appendChild(noteEl);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const noteId = e.currentTarget.getAttribute('data-id');
                const note = this.notes.find(n => n.id === noteId);
                if (note) {
                    this.showAddNoteModal(note);
                }
            });
        });
        
        document.querySelectorAll('.delete-note').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const noteId = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this note?')) {
                    this.deleteNote(noteId);
                }
            });
        });
    }
    
    deleteNote(noteId) {
        this.notes = this.notes.filter(note => note.id !== noteId);
        this.saveData();
        this.showToast('Deleted', 'Note has been removed.', 'info');
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Helper function to format dates
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// The initialization code is now in index.html to ensure proper loading order

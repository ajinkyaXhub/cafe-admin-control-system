// Global State
let menuItems = initialMenu;
let adminStats = { bookings: 0, orders: 0, revenue: 0 };
let adminActivity = [];
let fullOrdersList = [];

// Password protection logic
function handleEnter(e) {
    if (e.key === 'Enter') {
        checkLogin();
    }
}

function checkLogin() {
    const pwd = document.getElementById('admin-pwd').value;
    const error = document.getElementById('login-error');
    
    if (pwd === 'admin123') {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        showDashboard();
    } else {
        error.style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.querySelector('.admin-container').style.display = 'none';
    document.getElementById('admin-pwd').value = '';
}

// API Syncing
async function loadServerData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        if (data) {
            adminStats = data.stats || adminStats;
            adminActivity = data.activity || adminActivity;
            fullOrdersList = data.orders || fullOrdersList;
            if (data.menu && data.menu.length > 0) {
                menuItems = data.menu;
            }
            // Update Dashboard UI if visible
            if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
                updateDashboardUI();
            }
        }
    } catch (e) {
        console.error("Server fetch failed", e);
    }
}

async function saveServerData() {
    try {
        await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stats: adminStats,
                activity: adminActivity,
                orders: fullOrdersList,
                menu: menuItems
            })
        });
    } catch (e) {
        console.error("Server sync failed", e);
    }
}

function updateDashboardUI() {
    // Update Stats
    document.getElementById('stat-orders').innerText = adminStats.orders;
    document.getElementById('stat-revenue').innerText = formatCurrency(adminStats.revenue);
    document.getElementById('stat-bookings').innerText = adminStats.bookings;
    
    // Render Orders
    renderOrders(fullOrdersList);
    
    // Render Activity
    renderActivity(adminActivity);
    
    // Render Menu
    renderMenuManagement();
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    document.querySelector('.admin-container').style.display = 'block';
    loadServerData();
}

// Formatting utility
const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

// Tab Switching
function switchTab(tab) {
    const overview = document.getElementById('overview-tab');
    const menu = document.getElementById('menu-tab');
    const btns = document.querySelectorAll('.tab-btn');
    
    btns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'overview') {
        overview.style.display = 'block';
        menu.style.display = 'none';
        btns[0].classList.add('active');
        loadData();
    } else {
        overview.style.display = 'none';
        menu.style.display = 'block';
        btns[1].classList.add('active');
        renderMenuManagement();
    }
}

// Data Loading and Rendering
function loadData() {
    loadServerData();
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<div style="color: var(--text-light); text-align: center; padding: 40px 0;">No orders placed yet.</div>';
        return;
    }
    
    let html = '';
    orders.forEach(order => {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <li>
                    <span>${item.qty}x ${item.name}</span>
                    <span>${formatCurrency(item.price * item.qty)}</span>
                </li>
            `;
        });
        
        html += `
            <div class="order-item" id="order-${order.id}">
                <div class="order-header">
                    <span class="order-id">${order.id} ${order.status === 'completed' ? '<span style="color:var(--sage); font-size:12px;">(Completed)</span>' : ''}</span>
                    <span>${order.time}</span>
                </div>
                <div class="order-payment-method" style="font-size: 13px; color: var(--text-mid); margin-bottom: 8px;">
                    Payment: <strong>${order.paymentMethod || 'Not specified'}</strong>
                </div>
                <ul class="order-products">
                    ${itemsHtml}
                </ul>
                <div class="order-total" style="margin-bottom: 15px;">
                    Total: ${formatCurrency(order.total)}
                </div>
                <div style="text-align: right;">
                    ${order.status !== 'completed' ? `<button class="btn-danger" style="background:#e8f5e9; color:#2e7d32; border-color:#81c784; margin-right: 10px;" onclick="completeOrder('${order.id}')">Mark Completed</button>` : ''}
                    <button class="btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderActivity(activityList) {
    const list = document.getElementById('activity-list');
    if (!list) return;
    
    if (activityList.length === 0) {
        list.innerHTML = '<li style="color: var(--text-light);">No recent activity.</li>';
        return;
    }
    
    let html = '';
    activityList.forEach(act => {
        html += `<li>${act}</li>`;
    });
    
    list.innerHTML = html;
}

// Menu Management
function renderMenuManagement() {
    const list = document.getElementById('menu-management-list');
    if (!list) return;
    
    list.innerHTML = menuItems.map(item => `
        <tr>
            <td><img src="${item.img}" class="menu-thumb"></td>
            <td><strong>${item.name}</strong></td>
            <td style="text-transform: capitalize;">${item.cat}</td>
            <td>₹${item.price}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-edit" onclick="openEditModal(${item.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddModal() {
    document.getElementById('modal-title').innerText = 'Add Menu Item';
    document.getElementById('item-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('item-img-url').value = '';
    document.getElementById('upload-status').innerText = '';
    document.getElementById('item-modal').style.display = 'flex';
}

function openEditModal(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modal-title').innerText = 'Edit Menu Item';
    document.getElementById('edit-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-cat').value = item.cat;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-img-url').value = item.img;
    document.getElementById('item-tags').value = item.tags.join(', ');
    
    document.getElementById('upload-status').innerText = 'Current image: ' + item.img.split('/').pop();
    document.getElementById('item-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('item-modal').style.display = 'none';
}

async function saveItem(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('item-name').value;
    const cat = document.getElementById('item-cat').value;
    const price = parseInt(document.getElementById('item-price').value);
    const tags = document.getElementById('item-tags').value.split(',').map(t => t.trim()).filter(t => t !== '');
    
    // Check for new upload or existing URL
    let img = document.getElementById('item-img-url').value;
    const fileInput = document.getElementById('item-image-file');
    
    if (fileInput.files[0]) {
        document.getElementById('upload-status').innerText = 'Uploading...';
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                img = data.url;
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
                return;
            }
        } catch (e) {
            alert('Upload failed. Check server connection.');
            return;
        }
    }

    if (!img) {
        alert('Please select an image.');
        return;
    }
    
    if (id) {
        // Edit
        const index = menuItems.findIndex(i => i.id == id);
        menuItems[index] = { id: parseInt(id), name, cat, price, img, tags };
        logActivity(`Menu Item Updated: ${name}`);
    } else {
        // Add
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        menuItems.push({ id: newId, name, cat, price, img, tags });
        logActivity(`New Menu Item Added: ${name}`);
    }
    
    saveServerData();
    renderMenuManagement();
    closeModal();
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const item = menuItems.find(i => i.id === id);
        menuItems = menuItems.filter(i => i.id !== id);
        logActivity(`Menu Item Deleted: ${item.name}`);
        saveServerData();
        renderMenuManagement();
    }
}

function logActivity(msg) {
    adminActivity.unshift(msg);
    saveServerData();
}

// Clear Data
function clearData() {
    if (confirm('Are you sure you want to clear ALL session data? This will reset orders, bookings, and revenue.')) {
        adminStats = { bookings: 0, orders: 0, revenue: 0 };
        adminActivity = ["Data cleared by admin"];
        fullOrdersList = [];
        saveServerData();
        updateDashboardUI();
    }
}

function completeOrder(id) {
    let orderIndex = fullOrdersList.findIndex(o => o.id === id);
    if (orderIndex > -1) {
        fullOrdersList[orderIndex].status = 'completed';
        logActivity(`Order ${id} marked as completed.`);
        saveServerData();
        updateDashboardUI();
    }
}

function deleteOrder(id) {
    if (confirm(`Are you sure you want to delete order ${id}?`)) {
        fullOrdersList = fullOrdersList.filter(o => o.id !== id);
        logActivity(`Order ${id} deleted.`);
        saveServerData();
        updateDashboardUI();
    }
}

// Init
window.onload = () => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showDashboard();
    }
};

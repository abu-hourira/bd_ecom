async function loadDashboardStats() {
    try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) return;
        const stats = await res.json();

        document.getElementById('total-sales').textContent = `৳${stats.totalSales}`;
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-users').textContent = stats.totalUsers;

        const lowStockList = document.getElementById('low-stock-list');
        lowStockList.innerHTML = stats.lowStock.map(p => `
            <li>${p.name} (Stock: <strong style="color: var(--secondary-color);">${p.stock}</strong>)</li>
        `).join('') || '<li>All products are well stocked!</li>';

        const recentOrdersTable = document.getElementById('recent-orders-table');
        recentOrdersTable.innerHTML = stats.recentOrders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.user_name}</td>
                <td>৳${o.total_amount}</td>
                <td><span class="status-badge">${o.status}</span></td>
                <td>${o.payment_status}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
    }
}

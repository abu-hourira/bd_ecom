async function loadCart() {
    try {
        const res = await fetch('/api/cart');
        if (!res.ok) return;
        const items = await res.json();
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        if (!cartContainer) return;

        if (items.length === 0) {
            cartContainer.innerHTML = '<p>Your cart is empty.</p>';
            cartTotal.textContent = '0.00';
            return;
        }

        let total = 0;
        cartContainer.innerHTML = items.map(item => {
            const price = item.discount_price > 0 ? item.discount_price : item.price;
            total += price * item.quantity;
            return `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div>
                        <h4>${item.name}</h4>
                        <p>৳${price} x ${item.quantity}</p>
                    </div>
                    <div>
                        <button onclick="updateQuantity(${item.cart_id}, ${item.quantity - 1})" class="btn btn-primary" style="padding: 2px 8px;">-</button>
                        <span style="margin: 0 10px;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.cart_id}, ${item.quantity + 1})" class="btn btn-primary" style="padding: 2px 8px;">+</button>
                        <button onclick="removeItem(${item.cart_id})" class="btn" style="background: var(--secondary-color); padding: 2px 8px; margin-left: 15px;">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        cartTotal.textContent = total.toFixed(2);
    } catch (error) {
        console.error(error);
    }
}

async function addToCart(productId, quantity = 1) {
    try {
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        const data = await res.json();
        showToast(data.message);
    } catch (error) {
        showToast('Please login to add items to cart.');
    }
}

async function updateQuantity(cartId, newQty) {
    if (newQty <= 0) return removeItem(cartId);
    await fetch(`/api/cart/${cartId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
    });
    loadCart();
}

async function removeItem(cartId) {
    await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
    loadCart();
}

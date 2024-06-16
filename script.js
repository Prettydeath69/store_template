document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 1, name: 'T-Shirt', price: 20 },
        { id: 2, name: 'Mug', price: 10 },
        { id: 3, name: 'Notebook', price: 15 },
    ];

    const productGrid = document.querySelectorAll('.product-grid');
    productGrid.forEach(grid => {
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product-item');
            productDiv.innerHTML = `
                <img src="placeholder.png" alt="${product.name} Image">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button>Add to Cart</button>
            `;
            grid.appendChild(productDiv);
        });
    });
});

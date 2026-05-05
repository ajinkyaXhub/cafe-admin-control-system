const initialMenu = [
    // Coffee
    { id: 1, name: "Flat White", price: 250, cat: "coffee", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 2, name: "Cappuccino", price: 250, cat: "coffee", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 3, name: "Cafe Latte", price: 250, cat: "coffee", img: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 4, name: "Mocha", price: 270, cat: "coffee", img: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 5, name: "Long Black", price: 230, cat: "coffee", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 6, name: "Espresso", price: 140, cat: "coffee", img: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 7, name: "Piccolo Latte", price: 200, cat: "coffee", img: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=600", tags: [] },
    
    // Smoothies
    { id: 8, name: "Alkaline Smoothie", price: 390, cat: "smoothies", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", tags: ["wholefood", "sugar-free"] },
    { id: 9, name: "Nourish Smoothie", price: 390, cat: "smoothies", img: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", tags: ["vegan", "wholefood", "sugar-free"] },
    { id: 10, name: "Berry Nice To Meet You", price: 390, cat: "smoothies", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", tags: ["wholefood", "sugar-free"] },
    { id: 11, name: "PBC Protein Smoothie", price: 390, cat: "smoothies", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", tags: ["protein", "sugar-free"] },
    { id: 12, name: "Invigorate", price: 390, cat: "smoothies", img: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", tags: ["protein", "sugar-free"] },
    
    // Cold Coffee
    { id: 13, name: "Infinity Cold Coffee", price: 300, cat: "cold", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 14, name: "Cold Brew Coffee", price: 250, cat: "cold", img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 15, name: "Iced Latte", price: 275, cat: "cold", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 16, name: "Affogato", price: 320, cat: "cold", img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=600", tags: [] },
    
    // Wellness
    { id: 17, name: "Matcha Latte", price: 330, cat: "wellness", img: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 18, name: "Golden Latte", price: 250, cat: "wellness", img: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 19, name: "Hot Chocolate", price: 230, cat: "wellness", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 20, name: "Tropical Juice", price: 330, cat: "wellness", img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600", tags: ["sugar-free"] },
    { id: 21, name: "Cleanse Juice", price: 330, cat: "wellness", img: "https://images.unsplash.com/photo-1594498653385-d5172c532c00?auto=format&fit=crop&q=80&w=600", tags: ["sugar-free"] },
    { id: 22, name: "Kashmiri Kahwa", price: 275, cat: "wellness", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 23, name: "Indian Summer", price: 220, cat: "wellness", img: "https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&q=80&w=600", tags: [] },
    { id: 24, name: "One O Eight Kefir", price: 330, cat: "wellness", img: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=600", tags: [] }
];

if (typeof module !== 'undefined') {
    module.exports = initialMenu;
}

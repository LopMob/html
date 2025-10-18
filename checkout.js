document.addEventListener('DOMContentLoaded', async () => {
  const selectedContainer = document.getElementById('selected-dishes');
  const totalPrice = document.getElementById('total-price');

  const selectedIds = JSON.parse(localStorage.getItem('selectedDishes')) || [];
  const combo = JSON.parse(localStorage.getItem('selectedCombo')) || null;

  const apiKey = 'cccba07b-7e11-461c-b898-d8fc1720b9c7';
  const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/dishes?api_key=${apiKey}`);
  const dishes = await response.json();

  let selected = dishes.filter(d => selectedIds.includes(d.id));
  let total = selected.reduce((sum, d) => sum + d.price, 0);
  selectedContainer.innerHTML = '';

  // 🔹 Обычные блюда
  selected.forEach(dish => {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <h3>${dish.name}</h3>
      <p>${dish.price} ₽</p>
      <button class="remove-btn" data-id="${dish.id}">Удалить</button>
    `;
    selectedContainer.appendChild(card);
  });

  // 🔹 Комбо-набор (если выбран)
  if (combo) {
  const comboDishes = Object.values(combo)
    .map(id => dishes.find(d => d.id === id))
    .filter(Boolean);

  // Считаем итоговую сумму за комбо
  const comboTotal = comboDishes.reduce((sum, d) => sum + d.price, 0);
  total += comboTotal;

  // Создаём карточку комбо
  const comboCard = document.createElement('div');
  comboCard.classList.add('dish-card', 'combo-card');

  comboCard.innerHTML = `
    <img src="img/image.jpg" alt="Комбо-набор">
    <h3>Комбо-набор</h3>
    <p>${comboTotal} ₽</p>
    <button class="remove-btn" id="remove-combo">Удалить</button>
  `;

  selectedContainer.appendChild(comboCard);

  // Обработчик удаления комбо
  document.getElementById('remove-combo').addEventListener('click', () => {
    localStorage.removeItem('selectedCombo'); // очищаем комбо
    comboCard.remove(); // удаляем карточку с экрана
    updateTotal(); // пересчитываем сумму
  });
}


  totalPrice.textContent = `Итого: ${total} ₽`;

  // 🔹 Удаление блюда
  selectedContainer.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
      const id = +e.target.dataset.id;
      const updated = selectedIds.filter(d => d !== id);
      localStorage.setItem('selectedDishes', JSON.stringify(updated));
      location.reload();
    }

    if (e.target.id === 'remove-combo') {
      localStorage.removeItem('selectedCombo');
      location.reload();
    }
  });

  // 🔹 Отправка заказа
  document.getElementById('checkout-form').addEventListener('submit', async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());

    const selectedDishes = dishes.filter(d => selectedIds.includes(d.id));

    const soup = combo?.soup
      ? dishes.find(d => d.id === combo.soup)
      : selectedDishes.find(d => d.category === 'soup');

    const main = combo?.main_course
      ? dishes.find(d => d.id === combo.main_course)
      : selectedDishes.find(d => d.category === 'main-course');

    const salad = combo?.salad
      ? dishes.find(d => d.id === combo.salad)
      : selectedDishes.find(d => d.category === 'salad');

    const drink = combo?.drink
      ? dishes.find(d => d.id === combo.drink)
      : selectedDishes.find(d => d.category === 'drink');

    const dessert = combo?.dessert
      ? dishes.find(d => d.id === combo.dessert)
      : selectedDishes.find(d => d.category === 'dessert');

    const orderData = {
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone,
      delivery_address: formData.address,
      delivery_type: "now",
      comment: "",
      soup_id: soup ? soup.id : null,
      main_course_id: main ? main.id : null,
      salad_id: salad ? salad.id : null,
      drink_id: drink ? drink.id : null,
      dessert_id: dessert ? dessert.id : null
    };

    console.log("📦 Отправка заказа:", orderData);

    const res = await fetch(`https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      alert('✅ Заказ успешно оформлен!');
      localStorage.removeItem('selectedDishes');
      localStorage.removeItem('selectedCombo');
      window.location.href = 'index.html';
    } else {
      const errorText = await res.text();
      alert(`Ошибка при оформлении заказа:\n${errorText}`);
    }
    
  });
});

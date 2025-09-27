function renderDishes() {
  const categories = {
    soup: document.querySelector('#soups .dishes'),
    main: document.querySelector('#mains .dishes'),
    drink: document.querySelector('#drinks .dishes')
  };

  dishes.sort((a, b) => a.name.localeCompare(b.name));

  dishes.forEach(dish => {
    const card = document.createElement('div');
    card.classList.add('dish');
    card.setAttribute('data-dish', dish.keyword);

    card.innerHTML = `
      <img src="${dish.image}" alt="${dish.name}">
      <p class="name">${dish.name}</p>
      <p class="weight">${dish.count}</p>
      <p class="price">${dish.price} ₽</p>
      <button>Добавить</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      selectDish(dish);
    });

    categories[dish.category].appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderDishes);

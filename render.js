function renderDishes() {
  const categories = {
    soup: document.querySelector('#soups .dishes'),
    main: document.querySelector('#mains .dishes'),
    salad: document.querySelector('#salads .dishes'),
    drink: document.querySelector('#drinks .dishes'),
    dessert: document.querySelector('#desserts .dishes')
  };

  dishes.sort((a, b) => a.name.localeCompare(b.name));

  dishes.forEach(dish => {
    const card = document.createElement('div');
    card.classList.add('dish');
    card.setAttribute('data-dish', dish.keyword);
    card.setAttribute('data-kind', dish.kind);

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

  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      const kind = btn.dataset.kind;
      const dishes = section.querySelectorAll('.dish');

      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        dishes.forEach(d => d.style.display = '');
      } else {
        section.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dishes.forEach(d => {
          d.style.display = (d.dataset.kind === kind) ? '' : 'none';
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', renderDishes);

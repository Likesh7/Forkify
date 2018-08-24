import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
}

export const clearList = () => {
    elements.searchResList.innerHTML = '';
    elements.showButtons.innerHTML = '';
}

export const highlightSelected = id => {
    const resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach( el => {
        el.classList.remove('results__link--active');
    })

    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active'); // css selector to select all links based on attribute which
                                                                                       // in this case is href which is the # + id.    
}

export const limitRecipeTitle = ( title, limit = 17 ) => {
    const newTitle = [];
    if ( title.length >= limit ) {
        title.split(' ').reduce((acc, cur) => {
            if ( acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc+ cur.length;
        }, 0)
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}

const renderRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

// type can be either 'prev' or 'next'
const displayButtons = (page, type) => `
            <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
                <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
                    <svg class="search__icon">
                        <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
                    </svg>
                
            </button>
`;

const renderButtons = (page, totRecipes, resPerPage) => {
    const pages = Math.ceil(totRecipes / resPerPage);

    let buttons;
    if (page === 1 && pages > 1){
        buttons = displayButtons( page, 'next');
    }

    else if (page < pages){
        buttons = `
            ${displayButtons( page, 'prev')}
            ${displayButtons( page, 'next')}
        `;
    }

    else if (page === pages && pages > 1){
        buttons = displayButtons( page, 'prev');
    }
    elements.showButtons.insertAdjacentHTML('afterbegin', buttons);
};

export const renderResult = (recipes, page = 1, resPerPage = 10) => {
    // Divide the list
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);

    // Render the buttons
    renderButtons(page, recipes.length, resPerPage);
};


import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';


/* Global state of the app 
* - Search object
* - Liked Recipes
* - Shopping list object
* - Current recipes
*/

const state = {};

/* ------------ SEARCH CONTROLLER ------------  */

const controlSearch = async () => {
    // 1) Get search query from the view.

        const query = searchView.getInput();
               
    if (query) {
    // 2) Create a new query object and store it to state.
        state.search = new Search(query); 
    }

    // 3) Get the UI ready for results.
        searchView.clearInput();
        searchView.clearList();
        renderLoader(elements.searchRes);
    
        try {
            // 4) Get the search query results.
                await state.search.getResults();
            
            // 5) Display/render the result in the UI.
                clearLoader();
                searchView.renderResult(state.search.result); 
        } 
        catch (err) {
            alert('Error in retrieving query');
            clearLoader();
        }
    
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.showButtons.addEventListener( 'click', e => {
    const btn = e.target.closest('.btn-inline'); 
    
    if (btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearList();
        searchView.renderResult(state.search.result, goToPage);
        
    }
}); 


/* ------------ RECIPE CONTROLLER ------------  */

const controlRecipe = async () => {
    // Get id from the url.
    const id = window.location.hash.replace( '#', '' );
    
    if (id){
        // 1. Prepare UI for the result.
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // 2. Highlight the selected recipe.
        if(state.search) searchView.highlightSelected(id);
    
        // 3. Create a new Recipe object.

        state.recipe = new Recipe(id);
       
    try {
        // 4. Wait for the data of the recipe from the api.

            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

        // 5. Call the time and serving function.
        
            state.recipe.calcTime();
            state.recipe.calcServ();

        // 6. Render the result in the UI.
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        }
        catch (err) {
            alert('Error in receiving data');
        }
    }
}

['hashchange', 'load'].forEach( event => window.addEventListener( event, controlRecipe ));


/* ------------ LIST CONTROLLER ------------  */

const controlList = () => {
    // Add/show list only when there is no list
    
    if (!state.list) {
        state.list = new List();

    // Add the ingredients in the list and render the list in the UI

        state.recipe.ingredients.forEach( el => {
            const item = state.list.addItem( el.count, el.unit, el.ingredient );
            listView.renderItem(item);
        });
    }

    elements.shopping.addEventListener('click', e => {
        const id = e.target.closest('.shopping__item').dataset.getid;
        
        // Delete the ingredient from the state and UI

        if (e.target.matches('.shopping__delete, .shopping__delete *')) {
            // Delete from state
            state.list.deleteItem(id);

            // Delete from UI
            listView.deleteItem(id);
        }

        // Update the count in the state and the UI
        else if (e.target.matches('.shopping__count-value')) {
            if (parseFloat(e.target.value, 10) > 0 ) {
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount( id, val );
            }
        }
    });
}

/* ------------ LIKES CONTROLLER ------------  */



const controlLikes = () => {
    if (!state.likes) state.likes = new Likes();
        const currentId = state.recipe.id;
        
        // if the recipe is currently unliked.
        if (!state.likes.isLiked(currentId)) {
            // Add the liked recipe to the state.
            const newLike = state.likes.addLike(
                currentId,
                state.recipe.title,
                state.recipe.author,
                state.recipe.image
            );

            // Toggle the heart button.
            likeView.toggleLikeBtn(true);

            // Add the liked recipe to the UI.
            likeView.renderLikeList(newLike);

        }

        // if the recipe is currently liked.
        else {
            // Remove the liked recipe from the state.
            state.likes.deleteLike(currentId);

            // Toggle the heart button.
            likeView.toggleLikeBtn(false);

            // Remove the liked recipe from the UI.  
            likeView.deleteLike(currentId);
        }
        likeView.toggleLikeMenu(state.likes.getNumLikes());
}

//Restore liked recipes on page reload
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Read the liked recipes from storage
    state.likes.readStorage();

    // Toggle the like menu button
    likeView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the like menu list
    state.likes.likes.forEach( like => likeView.renderLikeList(like));
});

elements.recipe.addEventListener( 'click', e => {
    if ( e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked.
        if (state.recipe.servings > 1 ) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if ( e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked.
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shoppping list. 
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Add the recipe to the liked recipes
        controlLikes();
    }
    
});


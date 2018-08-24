import axios from 'axios';
import {proxy, key} from '../proxy';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe() {
        try {
        const res = await axios(`${proxy}http://food2fork.com/api/get?key=${key}&rId=${this.id}`);
        this.title = res.data.recipe.title;
        this.image = res.data.recipe.image_url;
        this.ingredients = res.data.recipe.ingredients;
        this.author = res.data.recipe.publisher;
        this.source = res.data.recipe.source_url;
        }
        catch (error){
            console.log(error);
            alert('Something is wrong :(');
        }
    }

    /* For each 3 servings it takes 15 minutes */
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServ() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds' ];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'gm'];

        const newIngredients = this.ingredients.map( el => {
            // 1. Uniform units
                let ingredient = el.toLowerCase();
                unitsLong.forEach( (unit, i) => {
                    ingredient = ingredient.replace( unit, unitsShort[i]);
                });
            
            // 2. Remove parenthesis
                ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            
            // 3. Divide the main ingredient to count, units and part ingredient
                const arrIng = ingredient.split(' ');
                const unitIndex = arrIng.findIndex( el2 => units.includes(el2) );

                let objIng;
                // When there is a number and a unit
                if (unitIndex > -1) {
                    // 4 1/2 cups of ingredients => [4, 1/2]
                    // 2 cups of ingredients => [2]
                    // 3-1/3 cups of ingredients => [3-1/3]

                    const arrCount = arrIng.slice(0, unitIndex);

                    let count;
                    if ( arrCount.length === 1 ) {
                        count = eval(arrIng[0].replace('-', '+'));
                    }
                    else {
                        count = eval(arrIng.slice(0, unitIndex).join('+'));
                    }

                    objIng = {
                        count,
                        unit: arrIng[unitIndex],
                        ingredient: arrIng.slice(unitIndex + 1).join(' ')
                    } 

                } 

                //When there is a number but no unit 
                else if (parseInt(arrIng[0], 10)) {
                    objIng = {
                        count: parseInt(arrIng[0], 10),
                        unit: '',
                        ingredient: arrIng.slice(1).join(' ')
                    }
                }

                //When there is no number and unit
                else if (unitIndex === -1) {
                    objIng = {
                        count: 1,
                        unit: '',
                        ingredient
                    }
                }


                return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        // update the servings in the model
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // update all the counts of all the ingredients of the recipe
        this.ingredients.forEach( ing => {
            ing.count *= (newServings/ this.servings);
        });

        this.servings = newServings;
    }
}
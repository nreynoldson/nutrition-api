const express = require('express');
const axios = require('axios');
const app = express();

const path = require('path');
var cors = require('cors');
app.use(cors());

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get('/api', async function(req, res){
    var item = req.query.item;
    var qty = req.query.qty;
    try{
        var response = await processNutritionalData(item, qty);
        res.status(200).json(response);
    }
    catch(error){
        res.status(error.response.status).send(error.message);
    }
    
});

async function processNutritionalData(query, qty){
    var data = await getIngredientData(query);
    var ing = data.foods[0];
    var servingGrams = ing.serving_weight_grams;

    var response = {};
    response.item = ing.food_name;
    
    if(!qty)
        qty = 100;

    response.calories = (ing.nf_calories / servingGrams * qty).toFixed(2);
    response.protein = (ing.nf_protein / servingGrams * qty).toFixed(2);
    response.fat = (ing.nf_total_fat / servingGrams * qty).toFixed(2);
    response.carbs = (ing.nf_total_carbohydrate / servingGrams * qty).toFixed(2);

    return response;
}
    

async function getIngredientData(query){
    var url = "https://trackapi.nutritionix.com/v2/natural/nutrients/"
    try {
		const {data} = await axios.post(url,{"query": query},
            { headers: {
                'x-app-id': '5dedf8e7',
                'x-app-key': 'f417ed938ff52b9a30b0628a7163d164',
                "Content-Type": "application/json"
            }});
		return data;
	} catch (error) {
		throw error;
	}
}

process.on('uncaughtException', function (error) {
    console.log(error.stack);
 });

const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});


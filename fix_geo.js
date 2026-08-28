const fs = require('fs');
let text = fs.readFileSync('website/js/43-geoapify.js', 'utf8');

text = text.split('headers: { "X-Api-Key": key }').join('');
text = text.split('let url = https://api.geoapify.com/v1/geocode/autocomplete?text=' + '$' + '{encodeURIComponent(query)}&lang=de&limit=5;').join('let url = https://api.geoapify.com/v1/geocode/autocomplete?text=' + '$' + '{encodeURIComponent(query)}&apiKey=' + '$' + '{key}&lang=de&limit=5;');
text = text.split('const res = await fetch(https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1, {').join('const res = await fetch(https://api.geoapify.com/v1/geocode/autocomplete?text=Bonn&limit=1&apiKey=' + '$' + '{key}); // {');

fs.writeFileSync('website/js/43-geoapify.js', text);

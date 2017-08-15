let express = require('express');
let path = require('path');

let app = express();
let publicPath = path.join(__dirname, './docs');
app.use(express.static(publicPath));

app.listen(8080, () => console.log('Server is up on port 8080'));

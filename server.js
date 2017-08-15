let express = require('express');
let path = require('path');

const PORT = process.env.PORT || 3000;

let app = express();
let publicPath = path.join(__dirname, './docs');
app.use(express.static(publicPath));

app.listen(3000, () => console.log(`Server is up on port ${PORT}`));

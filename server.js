let express = require('express');
let expiry = require('static-expiry');
let compression = require('compression');
let helmet = require('helmet');
let path = require('path');

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, './docs');

let app = express();
app.use(expiry(app, {dir: publicPath}));
app.use(compression());
app.use(helmet());
app.use(express.static(publicPath));

app.listen(PORT, () => console.log(`Server is up on port ${PORT}`));

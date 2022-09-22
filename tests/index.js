const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());

app.get('/', (req, res) => {
    res.send()
});

app.listen(9876);
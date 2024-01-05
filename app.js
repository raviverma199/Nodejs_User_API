const express = require('express')
const app = express()
const routes = require('./routes/route');
const helmet = require('helmet')

app.use(express.json())
app.use('/',routes)


// ================== content security policy ==========================


const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const express = require('express')
const app = express()
const routes = require('./routes/route')

app.use(express.json())
app.use('/',routes)



const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const express = require('express')
const app = express()
const routes = require('./routes/route')

app.use(express.json())
app.use('/',routes)



const port = process.env.PORT;

app.listen(port || 8000, () => {
    console.log(`Server is running on port ${port}`);
});

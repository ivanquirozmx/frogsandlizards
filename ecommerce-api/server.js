
import express from 'express';
import dotenv from 'dotenv';
import routes from './src/routes';
import dbConnedtion from './src/config/database';

dotenv.config();

const app= express();
dbConnedtion();
app.use(express.json());

app.get("/", (req, res)=> {
    res.send ("WELCOME!");
});
app .use("/api", routes);

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});


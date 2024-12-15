import express from "express";

const app = express();

const PORT = process.env.PORT || 3000;

const users = [
    {id:1, username: "anson", displayName: "Anson"},
    {id:2, username: "daniel", displayName: "Daniel"},
    {id:3, username: "christian", displayName: "Christian"},
    {id:4, username: "ca", displayName: "Christian"},
    {id:5, username: "ha", displayName: "Christian"},
    {id:6, username: "ai", displayName: "Christian"}
];

app.get('/', (req, res) => {
    res.send({'msg': 'Hello'})
});

app.get('/api/users', (req, res) => {
    console.log(req.query)
    const {
        query: { filter, value },
    } = req;
    
    if (filter && value) return res.send(
        users.filter((user) => user[filter].includes(value))
    );
    return res.send(users)
});

app.get('/api/users/:id', (req, res) => {
    console.log(req.params);
    const parsedId = parseInt(req.params.id);
    console.log(parsedId);
    if (isNaN(parsedId)) return res.status(400).send({msg: "Bad request. Invalid ID."});

    const findUser = users.find((user) => user.id === parsedId);
    if (!findUser) return res.sendStatus(404);
    return res.send(findUser);
});

app.get('/api/products', (reg, res) => {
    res.send([{id:123, name: 'chicken', price: 12.99}])
});

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
});

// imports
const { json } = require('express');
const express = require('express');
const { Client } = require('pg');
require('dotenv').config()

// declarations
const app = express();
const port = 8000;

const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME, 
    password: process.env.DB_PASSWORD,
    port: 5432,
});
client.connect();

app.use(express.json())


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// routes

app.get('/api/tickets', async (req, res) => {

    try {
        const data = await client.query('SELECT * FROM tickets');

        res.status(200).json(
            {
                status: "success",
                data: data.rows
            }
        )
    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: "erreur serveur"
            }
        )
        console.log(err.stack)
    }
})


app.get('/api/tickets/:id', async (req, res) => {
    const ticketId = req.params.id

    if (!Number.isNaN(Number(ticketId))) {
        try {
            const data = await client.query('SELECT * FROM tickets WHERE id=$1', [ticketId]);
            if (data.rows.length === 1) {
                res.status(200).json(
                    {
                        status: "success",
                        data: data.rows[0]
                    }
                )
            }
            else {
                res.status(404).json(
                    {
                        status: "fail",
                        message: "id ne correspond à aucun ticket"
                    }
                )
            }
        }
        catch (err) {
            res.status(500).json(
                {
                    status: "fail",
                    message: "erreur serveur"
                }
            )
            console.log(err.stack)
        }
    }
    else {
        res.status(404).json(
            {
                status: "fail",
                message: "numéro d'ID nécessaire"
            }
        )
    }
})


app.post('/api/tickets', async (req, res) => {
    console.log(req.body);
    const mess = req.body.message
    if (mess) {
        try {
            const data = await client.query('INSERT INTO tickets (message) VALUES ($1) returning *', [mess]);

            res.status(201).json(
                {
                    status: "success",
                    message: "message posté avec succés",
                    data: data.rows[0]
                }
            )
        }
        catch (err) {
            res.status(500).json(
                {
                    status: "fail",
                    message: "erreur serveur"
                }
            )
            console.log(err.stack);
        }
    }
    else {
        res.status(400).json(
            {
                status: "fail",
                message: "message obligatoire"
            }
        )
    }
})


app.delete('/api/tickets/:id', async (req, res) => {
    const deleteId = req.params.id
    if (!Number.isNaN(Number(deleteId))) {
        try {
            const data = await client.query('DELETE from tickets WHERE id= $1', [deleteId])

            if (data.rowCount === 1) {
                res.status(200).json(
                    {
                        status: "success",
                        message: "ticket supprimé"
                    }
                )
            }

            else {
                res.status(404).json(
                    {
                        status: "fail",
                        message: "id ne correspond à aucun ticket"
                    }
                )
            }
        }
        catch (err) {
            res.status(500).json(
                {
                    status: "fail",
                    message: "erreur serveur"
                }
            )
            console.log(err.stack);
        }
    }
    else {
        res.status(404).json(
            {
                status: "fail",
                message: "numéro d'ID nécessaire"
            }
        )
    }


}
)


app.put('/api/tickets/:id', async (req, res) => {

    const updateId = req.params.id
    const updateMess = req.body.message
    const updateDone = req.body.done

    if (!Number.isNaN(Number(updateId))) {
        if (updateMess && updateDone !== undefined) {
            if (updateDone === true || updateDone === false) {

                try {
                    const data = await client.query('UPDATE tickets SET  done = $3, message = $1 WHERE id = $2 RETURNING *', [updateMess, updateId, updateDone])

                    if (data.rowCount > 0) {
                        res.status(201).json({ status: "success", message: "données modifiées", data: data.rows[0] })
                    }
                    else {
                        res.status(404).json(
                            {
                                status: "FAIL",
                                message: "Aucun ticket ne correspond à cet id"
                            }
                        )
                    }
                }
                catch (err) {

                    res.status(500).json(
                        {
                            status: "FAIL",
                            message: "erreur serveur"
                        })
                }
            } else {
                res.status(400).json(
                    {
                        status: "FAIL",
                        message: "Booléen attendu"
                    }
                )
            }
        } else {
            res.status(400).json(
                {
                    status: "FAIL",
                    message: "valeur manquante"
                }
            )
        };

    } else {
        res.status(404).json(
            {
                status: "FAIL",
                message: "Nécessite un nombre valable en tant qu'Id"
            });
    };
});


app.all('*', function (req, res) {
    res.status(404).end("not found");
});



// ecoute le port 8000
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
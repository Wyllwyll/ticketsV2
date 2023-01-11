/* const express = require('express');
const { Client } = require('pg');
const ticketsRouter = express.Router(); */
//const { Client } = require('pg');
const express = require('express');
const client = require('../client');
const ticketsRouter = express.Router();





ticketsRouter.get('/', async (req, res) => {

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


ticketsRouter.get('/:id', async (req, res) => {
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


ticketsRouter.post('/', async (req, res) => {
    console.log(req.body);

    const mess = req.body.message
    const user_id = req.body.user_id

    if (mess && user_id!=null) {
        try {
            const data = await client.query('INSERT INTO tickets (message,user_id) VALUES ($1,$2) returning *', [mess, user_id]);

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
                message: "message ou id utilisateur obligatoire"
            }
        )
    }
})


ticketsRouter.delete('/:id', async (req, res) => {
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


ticketsRouter.put('/:id', async (req, res) => {

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




module.exports = ticketsRouter;
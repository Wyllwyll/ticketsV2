/* 
const { Client } = require('pg');
 */
const express = require('express');
require('dotenv').config()
const bcrypt = require('bcrypt');
const client = require('../client');
const usersRouter = express.Router();




usersRouter.post('/register', async (req, res) => {
    const user_name = req.body.user_name;
    const pass = req.body.password
    bcrypt.hash(pass, 10, async function (err, hash) {
        try {
            const data = await client.query('INSERT INTO users (user_name,password) VALUES ($1,$2) RETURNING *', [user_name, hash]);

            res.status(201).json(
                {
                    status: "success",
                    message: "register success",
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
    });
})


usersRouter.post('/login', async (req, res) => {
    const name = req.body.user_name;
    const pass = req.body.password
    try {
        const hashpass = await client.query('SELECT password FROM users WHERE user_name=$1', [name]);
        if (hashpass.rowCount > 0) {
            bcrypt.compare(pass, hashpass.rows[0]['password'], async function (err, result) {

                if (result == true) {
                    res.status(200).json(
                        {
                            status: "success",
                            message: "login success",
                            data: null
                        }
                    )
                }
                else {
                    res.status(403).json(
                        {
                            status: "fail",
                            message: "mot de passe incorrect",
                            data: null
                        }
                    )
                }
            }
            )
        }
        else {
            res.status(404).json(
                {
                    status: "fail",
                    message: "identifiant incorrect",
                    data: null
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
})



module.exports = usersRouter;
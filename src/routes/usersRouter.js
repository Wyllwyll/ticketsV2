
const express = require('express');
const bcrypt = require('bcrypt');
const client = require('../client');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config()
const accessTokenSecret= process.env.ACCESTOKENSECRET




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
        const data = await client.query('SELECT * FROM users WHERE user_name=$1', [name]);

        if (data.rowCount > 0) {
            const user = data.rows[0];
            bcrypt.compare(pass, user.password, async function (err, result) {

                if (result == true) {
                    const accessToken = jwt.sign({ userId: user.id }, accessTokenSecret);

                    res.status(200).json({
                        status: 'OK',
                        data : accessToken,
                        message: 'logged in'
                    });
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
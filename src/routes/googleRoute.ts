import express from 'express'
import {authenticateWithGoogle,authorizationWithGoogle,fetchGmailMessages} from '../auth/googleAuth'
const router = express.Router();


//Generating the authentication url 
router.get('/auth', async (req, res) => {
    const authurl = await authenticateWithGoogle();
    res.redirect(authurl);
})

//Authorizaion Code ---> Access Token + Refresh Token
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
        res.status(400).send('Authorization code not provided');
    }

    const resu = await authorizationWithGoogle(code);
    res.json(resu);
})

router.get('/fetchemail', async (req,res) => {
    const emails = await fetchGmailMessages();
    res.json({emails:emails});
})

export {router}
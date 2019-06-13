const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        try{
            
            const db = req.app.get('db')
            const {username, password, isAdmin} = req.body

            const result = await db.get_user([username])
            const extinguisher = result[0]
            
            if(extinguisher) {
                return res.status(400).send('Username taken')

            }

            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)

            let registeredUser = await db.register_user([isAdmin, username, hash])
            user = registeredUser[0];
            req.session.user = {isAdmin: user.is_admin, username: user.username, id: user.id}
            return res.status(201).send(req.session.user)







        } catch (error) {
            console.log('there was an error')
            res.status(500).send(error)
        }
    }, 

    login: async (req, res) => {
    try{
        const db = req.app.get('db')
        const {username, password} = req.body
       
        const foundUser = await db.get_user(username)
        user = foundUser[0]

        if(!user) {
            return res.status(401).send('User not found. Please register as a new user before logging in.')
        }

        let isAuthenticated = bcrypt.compareSync(password, user.hash)

        if(!isAuthenticated) {
            return res.status(401).send('Incorrect Password')
        }

        req.session.user = user
        res.send(req.session.user)


    }catch (error) {
            console.log('there was an error')
            res.status(500).send(error)
    }
    },

    logout: (req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    }

}
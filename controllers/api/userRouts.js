const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const auth = require('../../utils/auth');

router.get('/', (req,res)=>{
    User.findAll({
        attributes: { exclude: ['password'] }
    })
    .then(dbUserData=> res.json(dbUserData))
    .catch(err=>{
        res.status(500).json(err);
    });
});

router.get('/:id', (req,res)=>{
    User.findOne({
        attributes: { exclude: ['password']},
        where: {
            id: req.params.id
        },
        include: [
            {
                model: Post,
                attributes: ['id','title','post_content','created_date']
            },
            {
                model: Comment,
                attributes: ['id','comment_text','created_date'],
                include: {
                    model: Post,
                    attributes: ['title']
                }
            }
        ]
    })
    .then(dbUserData=>{
        if(!dbUserData) {
            res.status(400).json({message:'No user found with that id'})
            return;
        }
        res.jason(dbUserData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req,res)=>{
    User.create({
        username: req.body.username,
        email: req.body.email,
        password:req.body.password,
    })
    .then(dbUserData=>{
        req.session.save(()=>{
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            res.json(dbUserData);
        });
    });
});

router.post('/login', (req,res)=>{
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(dbUserData =>{
        if(!dbUserData) {
            res.status(400).json({message:'No user found with that email'})
            return;
        }

        const passwordMatch = dbUserData.checkPassowrd(req.body.password);

        if(!passwordMatch) {
            res.status(400).json({message:'Wrong Password'});
            return;
        }

        req.session.save(()=>{
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            res.json({user:dbUserData,message:'Logged in'});
        });
    });
});

router.put('/:id', auth, (req,res)=>{
    User.update(req.body,{
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
    .then(dbUserData=>{
        if(!dbUserData[0]) {
            res.status(404).json({message:'No users found with that id'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json(err);
    });
});

router.delete('/:id', auth,(req,res)=>{
    User.destroy({
        where: {
            id: req.perams.id
        }
    })
    .then(dbUserData =>{
        if(!dbUserData) {
            res.status(404).json({message:'No users found with that'});
            return;
        }
        res.json(dbUserData);
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
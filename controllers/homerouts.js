const router = requrie('express').Router();
const sequelize = require('../config/connections');
const { Post,User,Comment } = require('../models');

router.get('/', (req,res)=> {
    console.log(req.session);

    Post.findAll({
        attributes: [
            'id',
            'title',
            'created_date',
            'post_content'
        ],
        include:[
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id','iser_id','created_date'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData=> {
        const post = dbPostData.map(post=>post.get({plain: true}));
        res.render('homepage', {
            post,
            loggedIn: req.session.loggedIn
        });
    })
    .catch(err=> {
        console.log(err);
        res.status(500).json(err);
    })
});

router.get('/login', (req,res)=>{
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }
    res.render('login');
});

router.get('/post/:id', (req,res)=>{
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes:['id','title','created_date','post-content'],
        include: [
            {
                model: Comment,
                attributes: ['id','comment_text','post_id', 'user_id', 'created_date'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username'],
            }
        ]
    })
    .then(dbPostData=>{
        if (!dbPostData) {
            res.status(400).json({message:'No post with that id was found.'});
            return;
        }

        const post = dbPostData.get({plain: true });

        res.render('homepage', {
            post,
            loggedIn: req.session.loggedIn
        });
    })
    .catch(err=> {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;
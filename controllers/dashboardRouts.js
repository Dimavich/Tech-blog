const router = require('express').Router();
const sequelize = require('../config/connections');
const { Post, User, Comment } = require('../models');
const auth = require('../utils/auth');

router.get('/', auth, (req,res)=>{
    Post.findAll({
        where: {
            user_id: req.session.user_id
        },
        attributes: ['id','title','created_date','post_content'],
        include: [
            {
                modal: Comment,
                attributes: ['id', 'comment_text','post_id','user_id','created_date'],
                include: {
                    modal: Comment,
                    attributes: ['username']
                }
            },
            {
                modal: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData =>{
        const posts = dbPostData.map(post=> post.get({plain: true}));
        res.render('dashboard', {
            posts,
            loggedIn: true
        })
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/edit/:id', (req,res)=>{
    Post.findOne({
        where:{
            id:req.params.id
        },
        attributes: ['id','title','created_date','post_content'],
        include: [
            {
                modal: Comment,
                attributes: ['id', 'comment_text','post_id','user_id','created_date'],
                include: {
                    modal: Comment,
                    attributes: ['username']
                }
            },
            {
                modal: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData =>{
        const posts = dbPostData.map(post=> post.get({plain: true}));
        res.render('dashboard', {
            posts,
            loggedIn: true
        })
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json(err);
    });
}); 
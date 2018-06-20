const bcrypt = require('bcryptjs');
const util  = require('../util') ;
const APIError = require('../rest').APIError ;

module.exports = {

    'POST /api/user/register' : async (ctx,next)  =>  {
        const  username = ctx.request.body.username ;
        const  password = ctx.request.body.password ;
        const  avatarID = ctx.request.body.avatarID ;
        const signature = ctx.request.body.signature;

        const existUser = await util.getUserByName(username);
        if (existUser) throw new APIError('username_existed');

        const user = {
            username: username,
            password: await bcrypt.hash(password, await bcrypt.genSalt()),
            avatarID: avatarID,
            signature: signature,
            createdAt: Date.now()
        };

        await util.createUser(user);

        ctx.rest({});

        await next();

    },

    'POST /api/user/login': async (ctx, next) => {
        const username = ctx.request.body.username;
        const password = ctx.request.body.password;

        if (!(username && password)) throw new APIError('request_invalid');

        const user = await util.getUserByName(username);
        if (!user) throw new APIError('user_not_exist');

        if (!await bcrypt.compare(password, user.password)) throw new APIError('password_mismatch');

        ctx.session.user = user.id;

        ctx.rest({});

        await next();

    },

    'POST /api/user/logout': async (ctx, next) => {
        // unset session
        ctx.session.user = null;

        ctx.rest({});

        await next();
    },
    'POST /api/user/password/modify': async (ctx, next) => {
        const userID = ctx.session.user;

        // check if session is invalid
        if (!userID) throw new APIError('session_invalid');

        const oldPassword = ctx.request.body.oldPassword;
        const newPassword = ctx.request.body.newPassword;

        // check if the request is valid
        if (!(oldPassword && newPassword)) throw new APIError('request_invalid');

        // validate password
        let user = await util.getUserByID(userID);
        if (!await bcrypt.compare(oldPassword, user.password)) throw new APIError('password_mismatch');

        // modify password
        user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt());
        await user.save();

        ctx.rest({});

        await next();
    },
    'GET /api/user/info': async (ctx, next) => {

        let userID = ctx.request.query.id;
        if (!userID) {
            userID = ctx.session.user;
            // check if session is invalid
            if (!userID) throw new APIError('session_invalid');
        }

        // get user info
        const user = await util.getUserByID(userID);
        const gameCount = 1 ;

        ctx.rest({
            id: user.id,
            username: user.username,
            avatarID: user.avatarID,
            modelID: user.modelID,
            signature: user.signature,
            createdAt: user.createdAt,
            gameCount: gameCount
        });

        await next();
    },
};
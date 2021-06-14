import { validate } from 'class-validator';
import express, { Request, Response } from 'express';
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Post } from './entity/Post';
import { User } from "./entity/User";


const app = express();
app.use(express.json());

// CREATE
app.post('/users', async (req: Request, res: Response) => {

    const { name, email, role } = req.body;

    try {
        const user = User.create({ name, email, role });

        const validationErrors = await validate(user);
        if(validationErrors.length > 0) throw validationErrors;

        await user.save();

        return res.status(201).json(user);

    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

// READ
app.get('/users', async (req: Request, res: Response) => {

    try {
        const users = await User.find({ relations: ['posts'] });

        return res.status(200).json(users);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

// UPDATE
app.put('/users/:uuid', async (req: Request, res: Response) => {

    const uuid = req.params.uuid;
    const { name, email, role } = req.body;

    try {
        const user = await User.findOneOrFail({ uuid });

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        await user.save();

        return res.status(200).json(user);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

// DELETE
app.delete('/users/:uuid', async (req: Request, res: Response) => {

    const uuid = req.params.uuid;

    try {
        const user = await User.findOneOrFail({ uuid });

        await user.remove();

        return res.status(204).json();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

// FIND
app.get('/users/:uuid', async (req: Request, res: Response) => {

    const uuid = req.params.uuid;

    try {
        const user = await User.findOneOrFail({ uuid });

        return res.status(200).json(user);

    } catch (err) {
        console.log(err);
        return res.status(404).json({ user: 'User not found'});
    }
});

// CREATE A POST
app.post('/posts', async (req: Request, res: Response) => {

    const { userUuid, title, body } = req.body;

    try {
        const user = await User.findOneOrFail({ uuid: userUuid });

        const post = new Post({ title, body, user});

        await post.save();

        return res.status(201).json(post);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

// READ POSTS
app.get('/posts', async (req: Request, res: Response) => {

    try {
        const posts = await Post.find({ relations: ['user'] });

        return res.status(200).json(posts);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong'});
    }
});

createConnection().then(async connection => {
    app.listen(5000, () => console.log('Server up at http://localhost:5000'))
}).catch(error => console.log(error));

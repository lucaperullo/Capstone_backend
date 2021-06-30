//TODO: music routes
//TODO: generate music history on new user
//TODO: update music history when a user is listening to a song
//TODO: create a new playlist CRUD
import express from 'express'
import { MusicModel } from './schema';
import { authorizeUser } from "../../middlewares/jwt.js";
const musicRoutes = express.Router();


musicRoutes.get("/playlist", authorizeUser, async (req, res, next)=>{
    try {
        const playlist = await MusicModel.find()
        res.send(playlist)
    } catch (error) {
        console.log(error)
        next(error)
    }
})
    musicRoutes.post("/playlist", authorizeUser, async (req, res, next)=>{
        try {
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    })
    musicRoutes.put("/playlist/:id", authorizeUser, async (req, res, next)=>{
        try {
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    })
    musicRoutes.delete("/playlist/:id", authorizeUser, async (req, res, next)=>{
        try {
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    })
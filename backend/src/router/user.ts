import { Router } from "express";

const router = Router();

router.get('/', (req, res) => {
    //  user data more of that kind of stuff
  res.send('Hello Babe kya kar rahi ho!');
});


export const userRoute = router;

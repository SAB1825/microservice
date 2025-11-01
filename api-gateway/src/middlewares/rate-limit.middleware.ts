import rateLimit from "express-rate-limit";


export const limiter = rateLimit({
    windowMs : 15 * 60 * 1000, // 15 MINS
    max : 100 // LIMIT EACH IP TO 100 REQUESTS PER WINDOWms
})
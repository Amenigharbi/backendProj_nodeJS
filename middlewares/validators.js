const {validationResult } = require('express-validator');

//@desc middleware=>catch errors from rules if exist 
const validatorMiddleware=(req,res,next)=>{
    //find the validation errors in this request and wraps them in an object with handy functions 
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    next();
};
module.exports=validatorMiddleware;
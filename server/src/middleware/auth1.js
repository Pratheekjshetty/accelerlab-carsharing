import jwt from 'jsonwebtoken'

const authMiddleware1 = async (req,res,next)=>{
    const {token} = req.headers;
    if(!token){
        return res.status(401).json({success:false,message:"Not Authorized Login Again"})
    }
    try{
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({success:false,message:"Error"})
    }
}

export default authMiddleware1;
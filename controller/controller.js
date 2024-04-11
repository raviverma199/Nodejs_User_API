const express = require("express");
const cart_Schema = require("../DB_schema/cart_schema");


exports.GetUserData = async(req,res) => {
  try {
    let user_id = req.params.user_id; // get the id from url parameter
    if(!user_id){
        throw new Error('user_id is missing');
    }

    let Data = await cart_Schema.find({ UserID: user_id });

    if(Data.length > 0){
        res.json({data:Data})
    }else{
        res.json({msg:'something went wrong'})
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({msg:"internal server error"})
  }
};


exports.DeleteCart = async(req,res)=>{
    try {
        let ItemID = req.body.ItemID

        if(!ItemID){
            throw new Error('ItemID is missing')
        }

        let DeleteCart = await cart_Schema.deleteOne({ItemID : ItemID});

        if(DeleteCart.deletedCount == 1){
            res.json({msg:'Cart Deleted Sucessfully'});
        }else{
            res.json({msg:'something  went wrong!'});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({msg:"internal server error"})
    }
}

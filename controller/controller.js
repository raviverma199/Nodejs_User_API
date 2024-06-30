const express = require("express");
const cart_Schema = require("../DB_schema/cart_schema");


exports.GetUserData = async(req,res) => {
  try {

   
    // if(!user_id){
    //     throw new Error('user_id is missing');
    // }

    let Data = await cart_Schema.find({CashBack:{$lte:3},ItemPurchase:{$eq:99000000000009}})


    // let newdd = await cart_Schema.find({CashBack:{$in:3},ItemPurchase:{$}})
    
    // let Data = await cart_Schema.aggregate([
    //     {
    //         $group: {
    //             _id: "$CustomerName",
    //             CashBack: { $sum: 1 }
    //         }
    //     },
    //     {
    //         $limit:9
    //     },
    //     {

    //     }
        
       
    // ])
    let newdata = await cart_Schema.aggregate ([
        {
            $group:{
                _id:"$CustomerName",
                CashBack:{$sum:1}
            }
        }
    ])

    console.log(newdata);
    // let Data = await cart_Schema.aggregate([
    //     {
    //         $group: {
    //           _id: "$gender",
    //           total_quantity: { $sum: 1 }
    //         }
    //       },
    //       {
    //         $limit:10
    //       }
    // ]);

    if(Data.length > 0){
        res.json({data:Data})
    }else{
        res.json({msg:'not found matching data'})
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



exports.UpdateCart = async(req,res)=>{
    try {
        let UserId = req.body.user_id
        let Data = await cart_Schema.updateOne({_id : UserId},{$set : req.body},{new:true}).exec();
    } catch (error) {
        console.log(error);
    }
}
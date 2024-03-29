const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ProductModel = require("../models/ProductModel");
const ApiError=require('../utils/apiError');

//@desc get list of products
//@route GET /
//@access public
exports.getProducts = asyncHandler(async (req, res) => {
  //filtering
  const queryStringObj={... req.query};
  const excludesFields=["page","sort","limit","fields"];
  excludesFields.forEach(field=>delete queryStringObj[field]);

  //apply filteration using [gte|gt|lte|lt]
  let queryStr=JSON.stringify(queryStringObj);
  queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>`$${match}`);
  
  //pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;


  //build query 
  const mongooseQuery=ProductModel.find(JSON.parse(queryStr))
  .skip(skip)
  .limit(limit)
  .populate({path:"category",select:"name -_id"});
  
  //execute query
  const products=await mongooseQuery;
  res.status(200).json({ results: products.length, page, data: products });
});

//@desc Get specific product by id
//@route GET /:id
//@access public
exports.getProdById = asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  const product = await ProductModel.findById(id).populate({path:"category",select:"name -_id"});
  if (!product) {
    return next(new ApiError( `no product for this id ${id}` ,404));
  }
  res.status(200).json({ data: product });
});

//@desc create product
//@route POST /
//@access private
exports.createProduct= asyncHandler(async (req, res) => {
  req.body.slug=slugify(req.body.title);
  const product = await ProductModel.create(req.body);
  res.status(201).json({data: product});
});

//@desc update specific product
//@route PUT /:id
//@access PRIVATE
exports.updateProd= asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  if(req.body.title){
    req.body.slug=slugify(req.body.title);
  }
  const prod = await ProductModel.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true }
  );

  if (!prod) {
    return next(new ApiError( `no product for this id ${id}` ,404));
  }
  res.status(200).json({ data:prod });
});

//@desc delete specific product
//@route DELETE /:id
//@access PRIVATE
exports.deleteProd = asyncHandler(async (req, res,next ) => {
  const { id } = req.params;
  const prod= await ProductModel.findOneAndDelete(id);

  if (!prod) {
    return next(new ApiError( `no product for this id ${id}` ,404));
  }
  res.status(204).send();
});

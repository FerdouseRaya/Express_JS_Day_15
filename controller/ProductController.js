const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const ProductModel = require("../model/Product");
const logFilePath = './Server/log.txt';

class Product {
    async getAll(req, res) {
        try{      

            const products = await ProductModel.find({}).limit(20);
            const totalProduct = await ProductModel.count();
            
            if (products.length > 0) {
                return res.status(200).send(
                    success("Successfully received all products", {
                        TotalProduct: totalProduct,
                        CountPerPage: products.length,
                        result: products,
                        
                    })
                );
            }
            return res.status(400).send(failure("No products were found"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }
    async getSearchSort(req,res){
        try {
            //Adding Pagination
            const page = Number(req.query.page)||1;
            const productLimit = Number(req.query.limit)||10;
            const skip = (page -1 ) * productLimit;            

            const {
                sortparam ,
                sortorder,
                rating,
                fillRating,
                fillPrice,
                price,
                brand,
                category,
                search
            } = req.query;

            const errors = [];
            const tracedrating = rating;
            const traceprice = price;
            const filter={};

            if (sortparam !== undefined && !['price', 'rating', 'discountPercentage', 'stock'].includes(sortparam)) {
                //return res.status(400).send(failure("Invalid parameter for sortparam has been provided."));
                errors.push("Invalid parameter for sortparam has been provided.");
            }
            
            if (sortorder !== undefined && !['desc', 'asc'].includes(sortorder) && sortorder.trim() === '') {
                //return res.status(400).send(failure("Invalid parameter for sortorder has been provided or cannot be blank."));
                errors.push("Invalid parameter for sortorder has been provided or cannot be blank.");
            }        
            

            if (rating !== undefined) {  
                const parsedRating = parseFloat(tracedrating);
                if(isNaN(parsedRating)){
                    //return res.status(400).send(failure("Rating need to be in numeric form."));
                    errors.push("Rating need to be in numeric form.");
                }          
                if (fillRating !== undefined) {
                    if (!['high', 'low'].includes(fillRating)) {
                        //return res.status(400).send(failure("Invalid parameter for fillRating has been provided."));
                        errors.push("Invalid parameter for fillRating has been provided.");
                    }
            
                    filter.rating = fillRating === 'high' ? { $gte: tracedrating } : { $lte: tracedrating };
                }else {
                    filter.rating = parsedRating;
                }
            }

            if (price !== undefined) {
                const parsedPrice = parseFloat(traceprice);
                if(isNaN(parsedPrice)){
                    //return res.status(400).send(failure("Price need to be in numeric form."));
                    errors.push("Price need to be in numeric form.");
                }
                
                if (fillPrice !== undefined) {
                    if (!['high', 'low'].includes(fillPrice)) {
                        //return res.status(400).send(failure("Invalid parameter for fillPrice has been provided."));
                        errors.push("Invalid parameter for fillPrice has been provided.")
                    }
            
                    filter.price = fillPrice === 'high' ? { $gte: traceprice } : { $lte: traceprice };
                } else {
                    filter.price = parsedPrice;
                }
            }

            if (category !== undefined) {
                filter.category = { $regex: category, $options: 'i' };
            }

            if(brand!== undefined){
                filter.brand ={$regex: brand, $options:'i'};
            }

            if (search !== undefined) {
               filter. $or= [
                    { title: { $regex: search, $options: 'i' } }, 
                    { description: { $regex: search, $options: 'i' } }, 
                    { brand: { $regex: search, $options: 'i' } }, 
                    {category:{$regex: search, $options: 'i'}}
                  ]
                
            }

            if (errors.length > 0) {
                return res.status(400).send(failure("Invalid query parameters", errors));
            }
            const productsQuery = await ProductModel.find(filter)
                                               .skip(skip)
                                               .limit(productLimit)
                                               .sort({[sortparam]:sortorder});

            const totalProduct = await ProductModel.count(filter);
            if (productsQuery.length > 0) {
                return res.status(200).send(
                    success("Successfully received all products.", {
                        TotalProduct: totalProduct,
                        CountPerPage: productsQuery.length,
                        result: productsQuery,
                        
                    })
                );
            }
            return res.status(400).send(failure("No products were found according to your search!!!"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }



    async create(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                        .status(400)
                        .send(failure("Failed to add the user", validation));
            }
            const { title, description, price, stock,discountPercentage,rating,category } = req.body;


            const Product = await ProductModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                discountPercentage:discountPercentage,
                rating:rating,
                category:category
            });


            if (Product) {
                return res
                    .status(200)
                    .send(success("Successfully added the Product", Product));
            }
            return res
                .status(400)
                .send(failure("Failed to add the Product"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async getProductByID(req, res) {
        try {
          const { id } = req.query;
          const product = await ProductModel.find({_id:id});

          if (product) {
            return res.status(200).send(success("Great! Here is the searched Product.", product));
          } else {
            return res.status(400).send(failure("Failed to find the Product."));
          }
        } catch (error) {
          console.log(error);
          return res.status(500).send(failure("Internal server error"));
        }
    }

    async deleteProductByID(req,res){
        const{id} =req.query;
        try{
             const deleteItemResult = await ProductModel.deleteOne({_id:id});
            if(deleteItemResult){
                return res
                      .status(200)
                      .send(success('Item deleted Successfully',deleteItemResult));
            }
            else{
                return res
                        .status(400)
                        .send(failure('Item not found!'));
            }
        }
        catch(error){
                return res
                       .status(500)
                       .send(failure('Server error...'));
        }
    }

    async updateProductByID(req, res) {
        try {
             const { id } = req.query;
            const updatedData = req.body;        
            const updatedProduct = await ProductModel.findOneAndUpdate(
                                              {_id: id },
                                               updatedData,
                                                { new: true }
            );

        if (updatedProduct) {
            const logEntry = `User Data Updated: ${new Date().toISOString()}\n`;
            fs.appendFileSync(logFilePath, logEntry, 'utf-8');
            return res.status(200).send(success("Successfully updated the Product", updatedProduct));
        } else {
            return res.status(400).send(failure("Failed to update the Product"));
        }
          } catch (error) {
              console.log(error);
               return res.status(500).send(failure("Internal server error"));
          }
    }
    
}

module.exports = new Product();
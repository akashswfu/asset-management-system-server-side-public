const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const corsOptions = {
    origin:['http://localhost:5173'],
    credentials:true,
    optionSuccessStatus:200,
}
app.use(cors(corsOptions))
app.use(express.json())
// 




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ib4xmsu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();




    const userCollection = client.db('assetsUsers').collection('users');
    const assetsCollection = client.db('assetsUsers').collection('assets');
    const assetsReqCollection = client.db('assetsUsers').collection('assetsReq');


    //jwt api verify

    app.post('/jwt',async(req,res)=>{
        const user = req.body;       
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
          expiresIn:'10h',
        })
        res.send({token})
      })

      const verifyToken = (req,res,next)=>{
        
        
        if(!req.headers.authorization){
          return res.status(401).send({message:'forbidden access'});
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
          if(err){
            return res.status(401).send({message:'forbidden access'});
          }
          req.decoded=decoded;
          next();
        })
      }








    //Every user information add to database

    app.post('/users',async(req,res)=>{
        const user = req.body;
        
        const query = {email:user.email};
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
            return res.send({message:'user already exists',insertedId:null})
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
    })
    //get all the user

    app.get('/users',async(req,res)=>{
        
        const result = await userCollection.find().toArray();
        res.send(result);
    })

    //get single user

    app.get('/users/:hr',verifyToken,async(req,res)=>{
        
        const hr = req.params.hr;
        const query = {'myHr':hr};
        const result = await userCollection.find(query).toArray();
        res.send(result)
    })

    //update single value of noHr to Hr

    app.patch('/users/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const userData = req.body;
        // const options = {upsert:true};
        const updateDoc = {
            $set:{
                ...userData,
            }
        }
        const result = await userCollection.updateOne(query,updateDoc);
        res.send(result);
    })


    //Check hr team list

    app.get('/users/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {'myHr':email};
        const result = await assetsCollection.find(query).toArray();
        res.send(result)
    })

    //remove from hr team

    app.get('/user',async(req,res)=>{
        const result = await userCollection.find().toArray();
        res.send(result);
    })

    app.patch('/user/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const userData = req.body;
        // const options = {upsert:true};
        const updateDoc = {
            $set:{
                ...userData,
            }
        }
        const result = await userCollection.updateOne(query,updateDoc);
        res.send(result);
    })

    //find single user data

    app.get('/user/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {email:email};
        const result = await userCollection.findOne(query);
        res.send(result)
    })



    

    
    
   

   






    // assets add , read, update, delete to database by HR only

    //data add
    app.post('/assets',async(req,res)=>{
        const assetsData = req.body;
        const result = await assetsCollection.insertOne(assetsData);
        res.send(result)
    })

    //get all assets
    app.get('/assets',async(req,res)=>{
        
        
        const result = await assetsCollection.find().toArray();
        res.send(result)
    })

    //get all data by hr email
    app.get('/assets/:email',async(req,res)=>{
        const email = req.params.email;
        const assetsStock = req.query.assetsStock;
        const assetsType = req.query.assetsType;
        const search = req.query.search;
        const sort = req.query.sort;

        const query = {
            'hrEmail':email,
            
        }
        if(search){
            query.productName= { $regex: search, $options: 'i' }
        }
        if(assetsType){
            query.type = assetsType
        }
        if(assetsStock){
            if(assetsStock==='in'){
                query.productQuantity = {$gt:0};
            }
            else{
                query.productQuantity = {$eq:0}
            }
        }
       
        const result = await assetsCollection.find(query).sort({productQuantity: sort==='dsc' ? -1 : 1}).toArray();
        res.send(result)
    })
    














    //get single data
    app.get('/asset/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await assetsCollection.findOne(query);
        res.send(result)
    })

    //update sinngle data
    app.put('/asset/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const assetData = req.body;
        const options = {upsert:true};
        const updateDoc = {
            $set:{
                ...assetData,
            }
        }
        const result = await assetsCollection.updateOne(query,updateDoc,options);
        res.send(result);
    })

    //delete single data
    app.delete('/asset/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await assetsCollection.deleteOne(query);
        res.send(result);
    })



    // assets req api

    app.post('/assetsReq',async(req,res)=>{
        const assetsReqData = req.body;
        const result = await assetsReqCollection.insertOne(assetsReqData);
        res.send(result)
    })



    app.get('/assetsReq/:email',async(req,res)=>{
        const email = req.params.email;
        const search = req.query.search;
        const sort = req.query.sort;
        const assetsType = req.query.assetsType;
        
        const query = { email, productName: { $regex: search, $options: 'i' } };
        if (sort) {
            query.status = sort;
        }
        if(assetsType){
            query.type = assetsType
        }
        
        const result = await assetsReqCollection.find(query).toArray();
        res.send(result);
    })




    //cancel a request by user

    app.delete('/assetsReq/:id',async(req,res)=>{
        const id = req.params.id;   
        const query = {_id: new ObjectId(id)};
        const result = await assetsReqCollection.deleteOne(query);
        res.send(result);
    })

    //approved a request by HR
    // app.patch('/assetsReq/:id', async(req,res)=>{
    //     const id = req.params.id;
    //     const query = {_id : new ObjectId(id)};
    //     const assetData = req.body;
    //     const updateDoc = {
    //         $set:{
    //             status:"Approved"
    //         }
    //     }
        
    //     const result = await assetsReqCollection.updateOne(query,updateDoc);
    //     res.send(result);
    // })

    app.patch('/assetsReq/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const assetsReqData = req.body;
        // const options = {upsert:true};
       
        
        const updateDoc = {
            $set:{
                status:assetsReqData.status
            }
        }
       
        const result = await assetsReqCollection.updateOne(query,updateDoc);
        res.send(result);
    })
    


    // assets quantity decrease by 1

    app.patch('/asset/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const assetData = req.body;
        const updateDoc = {
            $set:{
                productQuantity:assetData.productQuantity-1
            }
        }
        const result = await assetsCollection.updateOne(query,updateDoc);
        res.send(result);
    })


    // assets quantity increase by 1

    app.patch('/assets/:id', async(req,res)=>{
        const id = req.params.id;
      
        const query = {_id : new ObjectId(id)};
        const assetData = req.body;
        const updateDoc = {
            $set:{
                productQuantity:assetData.productQuantity+1
            }
        }
        
        const result = await assetsCollection.updateOne(query,updateDoc);
        res.send(result);
    })

    //all assets request get by hr


    // pagination added here all reqest for hr 


    app.get('/hrReq/:email',async(req,res)=>{
        const size = parseInt(req.query.size);
        const page = parseInt(req.query.page)-1;
        const email = req.params.email;
        const search = req.query.search;
        const query = {'hrEmail':email};
        if(search){
            query.name= { $regex: search, $options: 'i' }
        }
        const result = await assetsReqCollection.find(query).skip(page*size).limit(size).toArray();
        res.send(result)
    })

    // hr assets req count by user

    app.get('/hrReqs/:email',async(req,res)=>{
        const search = req.query.search;
        const email = req.params.email;
        const query = {'hrEmail':email};
        if(search){
            query.name= { $regex: search, $options: 'i' }
        }
      
        const count = await assetsReqCollection.countDocuments(query);
        res.send({count});
       
      })






    //payment intent

    app.post('/create-payment-intent',async(req,res)=>{
        const {packs} = req.body;
        const amount = packs*100;
        
  
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount:amount,
          currency:'usd',
          payment_method_types:['card']
        })
        res.send({
          clientSecret:paymentIntent.client_secret
        })
      })

      //update user payment 

    //   app.put('/user/:id', async(req,res)=>{
    //     const id = req.params.id;
    //     const query = {_id : new ObjectId(id)};
    //     const userData = req.body;
      
    //     const updateDoc = {
    //         $set:{
    //             ...userData,
    //         }
    //     }
    //     const result = await userCollection.updateOne(query,updateDoc,);
    //     res.send(result);
    // })


    app.patch('/userHr/:id', async(req,res)=>{
        const userData = req.body;
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};       
        
        const updateDoc = {
            $set:{
               pack:userData.pack
            }
        }
      
        const result = await userCollection.updateOne(query,updateDoc);
        res.send(result);
    })



    // Home for employ

    // pending status data get by employ

    app.get('/pendingReq',async(req,res)=>{
        const {email,status}=req.query;   
        const result = await assetsReqCollection.find({ email: email, status: status }).toArray();            
        res.send(result);
    })

    //get req data for this month
    app.get('/thisMonthReq/:email',async(req,res)=>{
        const email = req.params.email; 
       
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(),1);
        const formattedStartOfMonth = startOfMonth.toISOString();
       
        const result = await assetsReqCollection.find({ email: email,   requestData: { $gte: (formattedStartOfMonth) } }).sort({ requestData: -1 }).toArray(); 
     
        res.send(result);
    })


    //Home for Hr

    app.get('/pendingReqByHr',async(req,res)=>{
        const {email,status}=req.query;   

        const result = await assetsReqCollection.find({ hrEmail: email, status: status }).toArray();  
                
        res.send(result);
    })

    // all req by user for hr




   
  
    



    























    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("Server is running")
})

app.listen(port,()=>{
    console.log(`Server is running port : ${port}`);
})
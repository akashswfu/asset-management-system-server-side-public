const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

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

    app.get('/users/:hr',async(req,res)=>{
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
        const query = {'hrEmail':email};
        const result = await assetsCollection.find(query).toArray();
        res.send(result)
    })

    //get single data
    app.get('/asset/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await assetsCollection.findOne(query);
        res.send(result)
    })

    //update single data
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
        const query = {email:email};
        const result = await assetsReqCollection.find(query).toArray();
        res.send(result);
    })

    // data update by quantity

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

    //all assets request get by hr


    app.get('/hrReq/:email',async(req,res)=>{
        const email = req.params.email;
        const query = {'hrEmail':email};
        const result = await assetsReqCollection.find(query).toArray();
        res.send(result)
    })

    























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
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
import { appendFile } from "fs";

//var todayToDo = [];
//var workToDo = [];
const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


await mongoose.connect("mongodb+srv://admin-sinan:test123@cluster0.fnh91q9.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const defaultItem1 = new Item({
    name: "Welcome to your ToDo List!"
});

const defaultItem2 = new Item({
    name: "Hit the + button to add a new item."
});

const defaultItem3 = new Item({
    name: "<-- Hit the checkbox to delete an item."
});

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async (req, res) => {
    const itemQuery = Item.find({});
    const todoItems = await itemQuery.exec(); 
    if(todoItems.length === 0) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
    } else {
        res.render("today.ejs", {currentDay: "Today", todayToDo: todoItems});
    }

});

app.post("/", async (req, res) => {
    console.log(req.body.item);
    const itemName = req.body.item;
    const listName = req.body.listName;
    const newItem = new Item ({
        name: itemName
    });
    if(listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        var findList = await List.findOne({name: listName}).exec();
        findList.items.push(newItem);
        findList.save();
        res.redirect("/" + listName);
    }

    //res.render("today.ejs", {currentDay: currentDay, todayToDo: todayToDo});
});

app.post("/delete", async (req, res) => {
    console.log(req.body.checkbox);
    const itemId = req.body.checkbox;
    var listName = req.body.listName;
    if(listName === "Today") {
        const itemToDelete = Item.findByIdAndDelete(itemId);
        await itemToDelete.exec();
        res.redirect("/");        
    } else {
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}).exec();
        res.redirect("/" + listName);

    }

});

app.get("/:customListName", async (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    console.log(customListName);
    var findList = List.findOne({name: customListName});
    var findListResult = await findList.exec();
    if(!findListResult) {
        console.log("This list doesn't exist!");        
        const newList = new List({
            name: customListName,
            items: defaultItems
        });
        newList.save();
        res.redirect("/" + customListName);
    } else {
        res.render("today.ejs", {currentDay: customListName, todayToDo: findListResult.items});

    }

})

app.post("/work", (req, res) => {
    console.log(req.body.item);
    workToDo.push(req.body.item);
    res.render("work.ejs", {workToDo: workToDo});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
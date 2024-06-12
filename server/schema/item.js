const { ObjectId } = require("mongodb");
const Item = require("../models/ItemModels");

const itemEx = [
  {
    name: "Pepsi",
    imageUrl:
      "https://www.pepsi.com/content/dam/pepsi/en/brands/pepsi/pepsi-logo-horizontal.png",
    description:
      "Pepsi is a carbonated soft drink manufactured and manufactured by PepsiCo.",
    category: "Drink",
    stock: 100,
    buyPrice: 1000,
    sellPrice: 1500,
    createdAt: "2021-04-28T06:09:02.911Z",
    expiredAt: "2021-04-28T06:09:02.911Z",
    storeId: "66681bf2338fe8d36fd5663b",
    barcode: "123456789",
  },
];

const typeDefs = `#graphql
  
  type Item {
    _id: ID
    name: String
    imageUrl: String
    description: String
    category: String
    stock: Int
    buyPrice: Int
    sellPrice: Int
    createdAt: String
    storeId: ID
    barcode: String
  }

  type Message {
    message: String
  }

  type Query {
    items: [Item]
    item(id: ID!): Item
  }

  type Mutation {
    createItem(name: String!, imageUrl: String, description: String, category: String!, stock: Int!, buyPrice: Int!, sellPrice: Int!, createdAt: String!, storeId: ID, barcode: String): Item
    updateItem(id: ID!, name: String, imageUrl: String, description: String, category: String, stock: Int, buyPrice: Int, sellPrice: Int, storeId: ID, barcode: String): Item
  }
`;

const resolvers = {
  Query: {
    items: async () => {
      const items = await Item.find({});
      return items;
    },
    item: async (parent, { id }) => {
      const item = await Item.findById(id);
      return item;
    },
  },

  Mutation: {
    createItem: async (
      parent,
      {
        name,
        imageUrl,
        description,
        category,
        stock,
        buyPrice,
        sellPrice,
        createdAt,
        storeId,
        barcode,
      }
    ) => {
      const newItem = {
        name,
        imageUrl,
        description,
        category,
        stock,
        buyPrice,
        sellPrice,
        createdAt,
        storeId: new ObjectId(storeId),
        barcode,
      };
      // console.log("🚀 ~ newItem:", newItem);

      const item = await Item.createItem(newItem);

      if (item.acknowledged === true) {
        return newItem;
      }
    },
  },
};

module.exports = { typeDefs, resolvers };

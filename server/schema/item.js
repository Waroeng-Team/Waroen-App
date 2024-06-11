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
    barcode: "123456789",
  },
];

const item = `#graphql
  
  type Item {
    _id: ID
    name: String!
    imageUrl: String
    description: String
    category: String
    stock: Int
    buyPrice: Int
    sellPrice: Int
    createdAt: String
    expiredAt: String
    storeId: ID
    barcode: String
  }

  type Query {
    items: [Item]
    item(id: ID!): Item
  }

  type Mutation {
    createItem(name: String!, imageUrl: String, description: String, category: String, stock: Int!, buyPrice: Int!, sellPrice: Int!, createdAt: String!, storeId: ID, barcode: String): Item
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
      const newItem = new Item({
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
      });
      const item = await newItem.save();
      return item;
    },
  },
};

module.exports = { item, resolvers };

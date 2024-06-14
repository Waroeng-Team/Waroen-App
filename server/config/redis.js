const { Redis } = require("ioredis");

const redis = new Redis({
  port: 10508, // Redis port
  host: process.env.REDIS_HOST,
  username: "default",
  password: process.env.REDIS_PASSWORD,
  
});

module.exports = redis;
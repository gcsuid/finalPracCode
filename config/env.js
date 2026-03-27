const DEFAULT_MONGODB_URI = 'mongodb+srv://user1:Bhagya%402004@cluster0.irqmqzi.mongodb.net/problem-log-app?retryWrites=true&w=majority&appName=Cluster0';

module.exports = {
  port: Number(process.env.PORT) || 8081,
  mongoUri: process.env.MONGODB_URI || DEFAULT_MONGODB_URI
};

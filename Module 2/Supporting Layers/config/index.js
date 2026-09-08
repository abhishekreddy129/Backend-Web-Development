const config = {
    port: parseInt(process.env.PORT) || 3000,
    maxArticles: parseInt(process.env.MAX_ARTICLES) || 50,
    nodeEnv: process.env.NODE_ENV || 'development'
};

module.exports = config;
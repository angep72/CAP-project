const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors({
    exposedHeaders: ['OData-Version', 'Content-Type']
}));

app.use((req, res, next) => {
    if (req.url.includes('$batch')) {
        res.setHeader('OData-Version', '4.0');
        res.setHeader('Content-Type', 'multipart/mixed;boundary=batch_');
    }
    next();
});

const proxy = createProxyMiddleware({
    target: "http://localhost:4004/odata/v4/workers/",
    changeOrigin: true,
    pathRewrite: {
        '^/odata': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('OData-Version', '4.0');
        proxyReq.setHeader('Accept', 'application/json;odata.metadata=minimal;IEEE754Compatible=true');
        
        if (req.url.includes('$batch')) {
            proxyReq.setHeader('Content-Type', 'multipart/mixed;boundary=batch_');
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['odata-version'] = '4.0';
        
        if (req.url.includes('$batch')) {
            proxyRes.headers['content-type'] = 'multipart/mixed;boundary=batch_';
        } else {
            proxyRes.headers['content-type'] = 'application/json;odata.metadata=minimal;IEEE754Compatible=true';
        }
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
});

app.use("/odata", proxy);

app.listen(4000, () => {
    console.log('Proxy server running at http://localhost:4000');
});
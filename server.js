/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Jhonatan Lopez Olguin Student ID: [YOUR STUDENT ID] Date: [TODAY'S DATE]
*
*  Published URL on Vercel: [WILL BE FILLED AFTER DEPLOYMENT]
*
********************************************************************************/

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Import the sitesDB module
const SitesDB = require("./modules/sitesDB.js");
const db = new SitesDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({
        message: "API Listening",
        term: "Summer 2025",
        student: "Jhonatan Lopez Olguin"
    });
});

// POST /api/sites - Add a new site
app.post('/api/sites', (req, res) => {
    db.addNewSite(req.body)
        .then((newSite) => {
            res.status(201).json(newSite);
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
});

// GET /api/sites - Get all sites with pagination and optional filtering
app.get('/api/sites', (req, res) => {
    const { page, perPage, name, region, provinceOrTerritoryName } = req.query;
    
    // Validate required parameters
    if (!page || !perPage) {
        return res.status(400).json({ error: "page and perPage query parameters are required" });
    }

    db.getAllSites(page, perPage, name, region, provinceOrTerritoryName)
        .then((sites) => {
            if (sites.length === 0) {
                res.status(404).json({ message: "No sites found" });
            } else {
                res.json(sites);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
});

// GET /api/sites/:id - Get a specific site by ID
app.get('/api/sites/:id', (req, res) => {
    db.getSiteById(req.params.id)
        .then((site) => {
            if (site) {
                res.json(site);
            } else {
                res.status(404).json({ message: "Site not found" });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
});

// PUT /api/sites/:id - Update a site by ID
app.put('/api/sites/:id', (req, res) => {
    db.updateSiteById(req.body, req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch((err) => {
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        });
});

// DELETE /api/sites/:id - Delete a site by ID
app.delete('/api/sites/:id', (req, res) => {
    db.deleteSiteById(req.params.id)
        .then(() => {
            res.status(204).end();
        })
        .catch((err) => {
            if (err.message.includes('not found')) {
                res.status(404).json({ error: err.message });
            } else {
                res.status(500).json({ error: err.message });
            }
        });
});

// Initialize database connection and start server
db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(err);
});
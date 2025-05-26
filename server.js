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

require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Import the sitesDB module
const SitesDB = require("./modules/sitesDB.js");
const db = new SitesDB();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
    res.send({
        message: "API Listening",
        term: "Summer 2025",
        student: "Jhonatan Lopez Olguin"
    });
});

// POST /api/sites - Add a new site
app.post("/api/sites", async (req, res) => {
    try {
        const newSite = await db.addNewSite(req.body);
        res.status(201).send(newSite);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// GET /api/sites - Get all sites with pagination and optional filtering
app.get("/api/sites", async (req, res) => {
    const { page, perPage, name, region, provinceOrTerritoryName } = req.query;
    
    // Validate required parameters
    if (!page || !perPage) {
        return res.status(400).send({ message: "page and perPage query parameters are required" });
    }

    try {
        const sites = await db.getAllSites(page, perPage, name, region, provinceOrTerritoryName);
        if (sites.length === 0) {
            res.status(404).send({ message: "No sites found" });
        } else {
            res.status(200).send(sites);
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// GET /api/sites/:id - Get a specific site by ID
app.get("/api/sites/:id", async (req, res) => {
    try {
        const site = await db.getSiteById(req.params.id);
        if (!site) {
            return res.status(404).send({ message: "Site not found" });
        }
        res.status(200).send(site);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// PUT /api/sites/:id - Update a site by ID
app.put("/api/sites/:id", async (req, res) => {
    try {
        await db.updateSiteById(req.body, req.params.id);
        res.status(204).send();
    } catch (err) {
        if (err.message.includes('not found')) {
            res.status(404).send({ message: err.message });
        } else {
            res.status(500).send({ message: err.message });
        }
    }
});

// DELETE /api/sites/:id - Delete a site by ID
app.delete("/api/sites/:id", async (req, res) => {
    try {
        await db.deleteSiteById(req.params.id);
        res.status(204).send();
    } catch (err) {
        if (err.message.includes('not found')) {
            res.status(404).send({ message: err.message });
        } else {
            res.status(500).send({ message: err.message });
        }
    }
});

// Initialize database connection and start server
db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log(err);
});
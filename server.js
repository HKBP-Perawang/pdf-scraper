const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/extract-pdf", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        let pdfUrl = null;

        // **Tangkap semua request jaringan**
        page.on("request", (request) => {
            const requestUrl = request.url();
            if (requestUrl.endsWith(".pdf")) {
                pdfUrl = requestUrl;
            }
        });

        // **Buka halaman PDF Viewer**
        await page.goto(url, { waitUntil: "networkidle2" });

        await browser.close();

        if (pdfUrl) {
            res.json({ pdfUrl });
        } else {
            res.status(404).json({ error: "No PDF found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

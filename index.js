const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// IMPORTANT: needed for real deployment (proxy like Render, Nginx, etc.)
app.set("trust proxy", true);

app.get("/", async (req, res) => {
    try {
        // 🔹 Get visitor IP
        let ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            "";

        // 🔹 Clean IPv6 format
        ip = ip.replace("::ffff:", "");

        console.log("Visitor IP:", ip);

        // 🔴 Handle localhost case
        if (ip === "::1" || ip === "127.0.0.1") {
            return res.json({
                ip: ip,
                message: "Localhost detected. Deploy server to get real public IP."
            });
        }

        // 🔹 Get location data from IP API
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        const data = response.data;

        // 🔴 If API fails (reserved/private range)
        if (data.status === "fail") {
            return res.json({
                ip: ip,
                message: "Could not fetch location (private/reserved IP)",
                error: data.message
            });
        }

        console.log("Location Data:", data);

        // 🔹 Final response
        res.json({
            ip: ip,
            country: data.country,
            region: data.regionName,
            city: data.city,
            isp: data.isp,
            latitude: data.lat,
            longitude: data.lon
        });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
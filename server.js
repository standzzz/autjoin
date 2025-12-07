const express = require("express");
const app = express();
const axios = require("axios");
const cookie = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_A77836E828D2FD736CABF480A13BA597686D982CB2033FEF26BB28B4DDDB6AEF0A3B95575A43C008C40D6EABA6ABBFE4B4F6081A14CEBEE197BDFBFA30847BA34698ACF3365312FF14A2784F74B523B637CF53E15A5406138E8D313CBD7409109F4780AEFDA2EF180BA6B5E055E10E41F078308517C034C1CAA645ACC16DDC9A26579E127EAD6F48DFC2DBC72D100BDAC44B227E76AD164E50178F1EBC244ADA892C34063227DF70529116FD9029C84DC28D3FD956787244DC7969F9FBDFF4B79140CFBDCCDC3B8BEA275120D5674CD60DA2E9F9954098F8F6EEEC926C1BE5FED222EEDD2B689BF7A4D257281486F0A64944A568D3AC3CD4B54E8A7B7CCCAD0EA508BF781449E2DBC43813276A6FFBBE8B58FDE6028998A570469113E9EB29AEAD59C1F873B43BFFA16A2B02B1D9A26F21F07EA01B0F9E5EDEA01C3780A7FCC5124E6B2EF99A262ED4781A05A0B3E69AD9C5305B0B7E5D9F0B18E4F70D662CBF18424CF6D38F76165082C2D0B93BE2EFC4B4B943EC5A9308AE1FC63808A6284DF363EB4FF769E4114CFF7FAB66DFC15DFA46BB22D8559166B678D51AEB0E00EF0ADAB4F14026A2407BF05671E213DC05FC4482DC4A73D72B5AF8319BCD6A4068869E2235EAB19121FA24A072FF6BF31794763066DB14D6BDCACE2EEECB9C52279A9AACDBFA1473F268D27445FF5FA8D8033DF2226523065440CEF8C60CA3F82913A168D92590FD3CE2632EFB02DE33A284CB8AF8DCB527EAB10DBBE8BAA171889DF60F2A84AFFE66B393906D45408D3B7C71121B55F42598E2299031FEEA66B32C4A675E546EF1D0493FE581EE40508F8F6E618FFDEA88443E542635ACC9F4C5CFF4B99A3334A0B319B1DE7632216F6F15920D8C82C99DD2B5FC34E6594083DDAD92A2E2DE3288674249FCD74EFA80D01C5CBE324CE7086C80D6EF79FBC63E3744C48300BE65D3761A5F026EF32E0056B15F4A5E2D6CF2EA19A0FB4D356EAA230DA732F03FDA8DBCD98B739333C2361DA1DED929AEE00E478A9F5795B035B8A2D3F8DF67D9A928A6823E51B785B69D67BB2301EC12669F78B7F5DD864665FB1C023FA7E6E292B720297C96B9283E592A9371D478E6B1C9BCCED50DBDB6735C724B9103B6";
const fs = require("fs"); // Database integration
const crypto = require('crypto'); 

app.use(express.json());

let requests = [];

app.post("/addRequest", (req, res) => {
    const { scriptKey, message, params } = req.body;
    
    if (!scriptKey || !message || !params) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    requests.push([scriptKey, message, params]);
    res.json({ success: true, message: "Request added" });
});

app.post("/getRequests", (req, res) => {
    let { key } = req.body; // Getting the 'key' from query parameters

    if (!key) {
        return res.status(400).json({ error: "Missing required 'key' parameter" });
    }

    const dbFile = "database.json";

    // Check if the database exists
    if (!fs.existsSync(dbFile)) {
        return res.status(400).json({ error: "Database file not found." });
    }

    // Read the database
    let db = JSON.parse(fs.readFileSync(dbFile));

    // Filter logs that contain the key
    const filteredLogs = db.logs.filter(log => {
        console.log("log " + log)
         console.log("logbot " + log.bot)
        return log.key && log.key.includes(key); // Assuming the 'bot' field stores the key you're looking for
    });

    res.json(filteredLogs);
});
app.post("/listRequests", (req, res) => {
    let { key } = req.body; // Getting the 'key' from the request body
    console.log("got")
    if (!key) {
        return res.status(400).json({ error: "Missing required 'key' parameter" });
    }

    const dbFile = "database.json";
    console.log("Key received:", key);

    // Check if the database exists
    if (!fs.existsSync(dbFile)) {
        return res.status(400).json({ error: "Database file not found." });
    }

    // Read the database
    let db = JSON.parse(fs.readFileSync(dbFile));

    // Filter logs that contain the key
    const filteredLogs = db.logs.filter(log => 
        log.key && log.key.some(k => key.includes(k)) // ✅ Fix: Proper array comparison
    );

    console.log("Filtered logs:", filteredLogs); // Debugging

    if (filteredLogs.length === 0) {
        return res.status(404).json({ error: "No logs found for the given key." });
    }

    // Format the response as a string
    const responseString = filteredLogs.map(log => 
`\`\`\`
Target: ${log.target.join(", ")} 
Hours: ${log.hours.join(", ")}
Bot: ${log.bot}
Receipt: ${log.logId}
\`\`\``
    ).join("\n\n");

    res.send(responseString);
});


app.post("/removeRequest", (req, res) => {
    const { scriptKey, message } = req.body;
    
    requests = requests.filter(req => !(req[0] === scriptKey && req[1] === message));
    res.json({ success: true, message: "Request removed" });
});

const getUserIdFromUsername = async (username) => {
    try {
        console.log("[INFO] Fetching User ID for:", username);
        const response = await axios.post(
            "https://users.roblox.com/v1/usernames/users",
            { usernames: [username], excludeBannedUsers: true },
            { headers: { "Content-Type": "application/json" } }
        );
        if (response.data && response.data.data && response.data.data[0]) {
            const userId = response.data.data[0].id;
            console.log("[SUCCESS] Found User ID:", userId);
            return userId;
        }
        console.warn("[ERROR] User not found for username:", username);
        return null;
    } catch (error) {
        console.error(`[ERROR] Error fetching user ID for ${username}:`, error.message);
        return null;
    }
};

const logToDatabase = (bot, userId, target, hours, key) => {
    console.log("[DEBUG] Key passed to logToDatabase:", key);  // Add this line to debug the key

    let db = {};
    const dbFile = "database.json";

    if (fs.existsSync(dbFile)) {
        db = JSON.parse(fs.readFileSync(dbFile));
    }

    if (!db.logs) {
        db.logs = [];
    }

    // Generate a random ID using crypto
    const logId = crypto.randomBytes(16).toString('hex'); // 16 bytes gives you a 32-character hex string

    db.logs.push({
        logId,        // Store the random log ID
        bot,
        userId,
        target,
        hours,
        key,          // Make sure key is included here
        timestamp: Math.floor(Date.now() / 1000),
    });

    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    console.log(`Logged with ID: ${logId}`);
};

const removeLogFromDatabase = (logId) => {
    let db = {};
    const dbFile = "database.json";
  
    if (fs.existsSync(dbFile)) {
        db = JSON.parse(fs.readFileSync(dbFile));
    }

    if (db.logs && Array.isArray(db.logs)) {
        // Remove the log entry with the matching logId
        db.logs = db.logs.filter(log => log.logId !== logId);
    }

    // Save the updated database back to the file
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
    console.log(`Log with ID: ${logId} removed`);
};
app.post("/removeid", (req, res) => {
    const { id } = req.body;
    
    removeLogFromDatabase(id);
    res.json({ success: true, message: "Request removed" });
});

app.post("/removeidspecific", (req, res) => {
    const { id, key } = req.body;

    // Check the incoming id and key
    console.log("Received ID:", id[0]);
    console.log("Received Key:", key[0]);

    let db = {};
    const dbFile = "database.json";

    if (fs.existsSync(dbFile)) {
        db = JSON.parse(fs.readFileSync(dbFile));
    }

    if (db.logs && Array.isArray(db.logs)) {
        // Check if any log contains the matching logId and key
        let logFound = false;
        
        db.logs = db.logs.filter(log => {
            const logIdMatches = log.logId === id[0];  // Strict comparison for logId
            const keyMatches = log.key[0] && log.key[0] === key[0];  // Check if key exists and matches
            console.log(log.key[0])
            if (logIdMatches && keyMatches) {
                logFound = true;
            }

            return !(logIdMatches && keyMatches);  // Remove if both match
        });

        if (!logFound) {
            return res.json({ success: false, message: "No log found with the provided ID and matching key." });
        }

        // Log the updated logs to check if the filter worked
        console.log("Updated Logs:", db.logs);
    }

    // Save the updated database back to the file
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2)); 
    console.log(`Log with ID: ${id[0]} removed if key matches: ${key[0]}`);

    res.json({ success: true, message: "Removed log with the provided ID and key." });
});

app.post("/logBots", async (req, res) => {
    let { botlist, key, hours, target } = req.body;

    if (!botlist || !key || !hours || !target) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    if (typeof botlist === "string") {
        botlist = botlist.split(",").map(bot => bot.trim());
    }

    if (Array.isArray(botlist) && botlist.length === 1 && typeof botlist[0] === "string" && botlist[0].includes(",")) {
        botlist = botlist[0].split(",").map(bot => bot.trim());
    }

    if (!Array.isArray(botlist)) {
        return res.status(400).json({ error: "Invalid bot list format." });
    }
  console.log(botlist + "; " + key + "; " + hours + "; " + target)
    let onlineBots = [];

    for (const bot of botlist) {
        const userId = await getUserIdFromUsername(bot);
        if (!userId) continue;

        try {
            const response = await axios.post(
                "https://presence.roblox.com/v1/presence/users",
                { userIds: [userId] },
                { headers: { "Content-Type": "application/json", "Cookie": `.ROBLOSECURITY=${cookie}` } }
            );

            if (response.data && response.data.userPresences && response.data.userPresences.length > 0) {
                const presence = response.data.userPresences[0];
                if (presence.userPresenceType === 2) {
                    onlineBots.push({ username: bot, userId });
                }
            }
        } catch (error) {
            console.error(`Error checking presence for bot ${bot} (user ID: ${userId}):`, error.message);
            continue;
        }
    }

    if (onlineBots.length > 0) {
        const chosenBot = onlineBots[Math.floor(Math.random() * onlineBots.length)];
        logToDatabase(chosenBot.username, chosenBot.userId, target, hours,key);
        console.log("logged")
        return res.json({
            success: true,
            message: `**Now Sniping**\nTarget: ${target}\nHours: ${hours}\nHost Bot: ${chosenBot.username}`,
            userId: chosenBot.username
        });
    } else {
        return res.json({ success: false, message: "No bot is online." });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

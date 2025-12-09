// Load environment variables
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require("axios")
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
let pending = {};
let pp = {};
let crypto = {};
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
async function getUserPresenceById(userId) {
    const url = "https://presence.roblox.com/v1/presence/users";
    const requestBody = {
        userIds: [userId], // Single user ID as an array
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": ".ROBLOSECURITY=_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_11655976769E50F1553CD6BDC3A41BACF44055F87F2217333ED98CF1F7B1CA55EE9B2C6DD02CA54CAE95AB7269FFCF0DC0AD822736CA371E7F03C7E28058B6ABB459655DE99D8BC4AC1541B2CC9DBB3800BE6563BCEBB3087717CDEB04E9CEAFF936522F8B9F986AA71FDD0C8F49740D01648F35EDB46FDAB0B13DAF01AB4A06B71BAFCC842E423A59FFCFA7776BA2C6ED97381479D766702989427D536D2455EBC5609E130DC70787BDA1F3B60F44D316CC38D8A301681BFF933EBD113E592FCCF67AE981A64BD4385DE00177126AFDA89BFCF03417835B34B777E87D54D3FEE3CC9D98E761A3635A9B2767DCC0F0B2BE86274402BA12FDE5552C2F62320DEE63C22592746C57D3C907CABBCE4FB00C6A03DB798E59C384235D9F6C5DD6D3B463E80871CB4D4577FD844052E558CDBFD15F082D0F6535543A42EE32A96B174E6F671D330ADB0C9BB91EDD290159D0A0AA236AA233F57411D65A6E4696A256A573EB59411E9E72562711BEFCADF4C7D4BC0C277BEAA328E5A909368D92E370C6EC3320C7B245AFBE9321B0C8D72A2C13511368C35CFCDA8EB78AD428E71CABB317A0CBA8B0A8F7B59E37D132CAEFB2857D9C8448CCB2A2A0721B937AFEA340F5E44787424AA11218085374F51054A94DBA924D6A8955C9815CF410213E46AD9376BB34307D66083E6B475723695DD07F5DEECF97381411428FE495EE4BD0E01B9F6C1CDADFA2DE41709DAFEE35FB5C54FECA8E857EA4925464CB30F30E3488B119524295A3C09982108E00AB9B6B736CEDF8091BF86D20749590FBC70C17253E4463CDF9028C916367495678E12813715B810905E8A16FF692669E1338A81CEC6EC96AFD033579E405D672EB8623EB4597ABB4AC94D3DE6FAB8DDB3E03C099CD0F4695DD132E8A406D69F566E9F5639108054758D91D49399D641159412B81588CA0C538F0F7FA41863C8148C4812CA3DFB4015050F1976B58396B6982ABDC923636C0FD30A78B3F2EA30A4DC3E6445E92007E84BA39473900118D666F00E670C41B07DD33E1C76E084A7E2654AABF324CCBB379EB09DC6E563252BD7E607C3FBEE15B312FFB3A99CEA565DD8C738464F36027C9", // Replace with your .ROBLOSECURITY cookie
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch presence data: ${response.statusText}`);
        }

        const data = await response.json();
        const presence = data.userPresences[0];

        if (!presence) {
            console.log("No presence data found for this user.");
            return null;
        }

        return {
            userId: presence.userId,
            inGame: presence.userPresenceType === 2, // Check if the user is in a game
            placeId: presence.placeId || null,
            gameId: presence.gameId || null,
        };
    } catch (error) {
        console.error("Error fetching user presence:", error);
        return null;
    }
}

// Example usage
getUserPresenceById(3733635534) // Replace with an actual user ID
    .then((user) => {
        if (user) {
            console.log(`User ${user.userId}:`);
            if (user.inGame) {
                console.log(`- In a game at placeId: ${user.placeId}, gameId: ${user.gameId}`);
              if (user.placeId) {
                if (user.gameId) {
                  console.log("yes active yute")
                }
              }
            } else {
                console.log("- Not currently in a game.");
            }
        }
    });



async function addToLuaTable({
  owner,
  repo,
  path,
  token,
  username,
  id,
  channelid,
  branch = "main"
}) {
  try {
    // Step 1: Get the current file content (to retrieve the SHA)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const getResponse = await axios.get(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      },
      params: { ref: branch }
    });

    const sha = getResponse.data.sha; // Required for file update
    let fileContent = Buffer.from(getResponse.data.content, 'base64').toString('utf8'); // Decode base64 content

    // Step 2: Modify the Lua table by adding the new entry
    let updatedContent = addEntryToLuaTable(fileContent, username, id, channelid);

    // Step 3: Encode the new content in Base64
    const encodedContent = Buffer.from(updatedContent).toString("base64");

    // Step 4: Update the file on GitHub
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const updateResponse = await axios.put(
      updateUrl,
      {
        message: "Add new entry to Lua table",
        content: encodedContent, // New content
        sha, // Required SHA of the file to update
        branch // Optional: branch to commit to
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );

    console.log("File updated successfully:", updateResponse.data.commit.html_url);
  } catch (error) {
    console.error("Error editing file:", error.response?.data || error.message);
  }
}

// Helper function to modify the Lua table
function addEntryToLuaTable(fileContent, username, id, channelid) {
  // Find where the table starts and ends
  const tableStartIndex = fileContent.indexOf("local autojoins = {");
  const tableEndIndex = fileContent.indexOf("return autojoins");

  // Get the content inside the table (before the "return autojoins" line)
  let tableContent = fileContent.slice(tableStartIndex + 21, tableEndIndex).trim();
  console.log(tableContent)
  // Add the new entry: [username] = { ["id"] = id, ["channelid"] = channelid }
  const newEntry = `    ["${username}"] = { ["id"] = ${id}, ["channelid"] = ${channelid} },`;

  // Rebuild the Lua table and return the updated content
  const updatedTable = `local autojoins = {\n${newEntry}\n${tableContent}\n\n\nreturn autojoins`;
  return updatedTable;
}

//addToLuaTable({
  //owner: "standzzz",
 // repo: "autjoin",
 // path: "bigman.lua",
  //token: "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",
 // username: "exampleUser", // Example username to add
 // id: 121323, // Example ID to associate with username
  //channelid: 121212 // Example channelid to associate with username
//});

async function getTransactionSummary(blockchain, network, transactionId, context = null) {
  const apiKey = '3eee1f4f7767072d5ea7a4553dacac0bc1fdee44'; // Replace with your actual API key
  const baseUrl = 'https://rest.cryptoapis.io';

  const url = new URL(`${baseUrl}/blockchain-data/${blockchain}/${network}/transactions/${transactionId}`);

  if (context) {
    url.searchParams.append('context', context);
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Error fetching transaction details: ${response.statusText}`);
    }

    const data = await response.json();
    const transactionData = data.data.item;

    // Direct variables for confirmation status, sender/receiver details, and amounts
    const isConfirmed = transactionData.isConfirmed;

    const senderAddress = transactionData.senders.length > 0 ? transactionData.senders[0].address : null;
    const senderAmount = transactionData.senders.length > 0 ? transactionData.senders[0].amount : null;

    const receiverAddress = transactionData.recipients.length > 0 ? transactionData.recipients[0].address : null;
    const receiverAmount = transactionData.recipients.length > 0 ? transactionData.recipients[0].amount : null;

    // Return the required values directly
    return {
      isConfirmed,
      senderAddress,
      senderAmount,
      receiverAddress,
      receiverAmount,
    };
  } catch (error) {
    console.error('Failed to fetch transaction details:', error);
    throw error;
  }
}

// Example usage
(async () => {
  try {
    const blockchain = 'bitcoin';
    const network = 'testnet';
    const transactionId = '4b66461bf88b61e1e4326356534c135129defb504c7acb2fd6c92697d79eb250';
    const context = 'yourExampleString';

    const transactionDetails = await getTransactionSummary(blockchain, network, transactionId, context);
    console.log('Transaction Details:', JSON.stringify(transactionDetails, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
})();

function updateTables(type, userId) {
  // Remove the user ID from both tables
  if (pp[userId]) {
    delete pp[userId];
  }
  if (crypto[userId]) {
    delete crypto[userId];
  }

  // Add the user ID to the specified table
  if (type === "paypal") {
    pp[userId] = true;
  } else if (type === "crypto") {
    crypto[userId] = true;
  }
}
const app = express();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
  ],
});

app.use(bodyParser.json()); // To parse JSON requests

// Example endpoint to receive data from Roblox
app.post("/receive-data", async (req, res) => {
    const { userId } = req.body;

    console.log(`Received data: User ID = ${userId}`);

    try {
        const userPresence = await getUserPresenceById(userId);

        if (userPresence && userPresence.inGame && userPresence.placeId && userPresence.gameId) {
            console.log("Sending response:", {
                success: true,
                inGame: true,
                placeId: userPresence.placeId,
                gameId: userPresence.gameId,
            });
            res.json({
                success: true,
                inGame: true,
                placeId: userPresence.placeId,
                gameId: userPresence.gameId,
            });
        } else {
            console.log("Sending response: inGame = false");
            res.json({
                success: true,
                inGame: false,
            });
        }
    } catch (error) {
        console.error("Error fetching user presence:", error);
        res.json({
            success: false,
            message: "Error fetching user presence",
        });
    }
});


const PAYPAL_CLIENT_ID = 'ARFDkYDWWwXk-Hkh-PhTyvvumC5EWQxN60d0GwOmxr2qZYPZX4JW_CBOClBazjX5jjcFT_nT9snavYhr';
const PAYPAL_SECRET = 'EG8veV8HIPRTqv9jKSFx2pq7nVAPPckvRF5BiGgOM7hxZ8bAp5qYYmZjmXzUkmETxoV_c08Ajz_JyO0F';
const PAYPAL_API = 'https://api.paypal.com'; // Use 'https://api.sandbox.paypal.com' for sandbox

// Function to get an access token from PayPal
async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

  try {
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, 'grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining PayPal access token:', error.response ? error.response.data : error.message);
    throw error;
  }
}

function getPendingPaymentsAsString() {
  let result = '';

  // Loop through the `pending` object to generate the string
  for (const userId in pending) {
    if (pending.hasOwnProperty(userId)) {
      const { total, product } = pending[userId];
      result += `User ID: ${userId}\nTotal: $${total}\nProduct: ${product}\n\n`;
    }
  }

  // Return the formatted string
  return result || 'No pending payments.';
}
const token = process.env.SECRET;
const prefix = '.';
async function checkPaypalTransactions(transactionId) {
  const accessToken = await getAccessToken();
  const transactions = [];

  // Get current date
  const today = new Date();
  // Calculate start date (29 days before today)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 29);

  // Calculate end date (the day after today)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 1);

  try {
    const response = await axios.get(`${PAYPAL_API}/v1/reporting/transactions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        start_date: startDate.toISOString().split('T')[0] + 'T00:00:00Z',
        end_date: endDate.toISOString().split('T')[0] + 'T23:59:59Z',
        page_size: 100,
        page: 1,
      }
    });

    transactions.push(...response.data.transaction_details);

    // Check if the transaction exists in the current batch
    const transaction = transactions.find(t => t.transaction_info.transaction_id === transactionId);
    return transaction ? transaction : 'Transaction not found in the specified range.';
  } catch (error) {
    console.error('Error fetching PayPal transactions:', error.response ? error.response.data : error.message);
    return 'Error occurred while fetching transactions.';
  }
}
// Load existing user tickets
const userTicketsPath = path.join(__dirname, 'userTickets.json');
let userTicketsData = { users: {} };

if (fs.existsSync(userTicketsPath)) {
  userTicketsData = JSON.parse(fs.readFileSync(userTicketsPath, 'utf8'));
}

// Function to save user tickets
function saveUserTickets() {
  fs.writeFileSync(userTicketsPath, JSON.stringify(userTicketsData, null, 2), 'utf8');
}

// Start Discord bot
async function startApp() {
  try {
    await client.login(token);
    console.log("Successfully logged in Discord bot.");
  } catch (error) {
    console.error("Discord bot login error: " + error + token);
    process.exit(1);
  }

  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setPresence({
      status: "dnd",
      activities: [{ name: "the money flow", type: "WATCHING" }],
    });
  });
}
startApp();
const transIdsPath = path.join(__dirname, 'transids.json');
let transIdsData = {};

// Load existing transaction IDs if the file exists
if (fs.existsSync(transIdsPath)) {
  transIdsData = JSON.parse(fs.readFileSync(transIdsPath, 'utf8'));
}

// Function to save transaction IDs
function saveTransIds() {
  fs.writeFileSync(transIdsPath, JSON.stringify(transIdsData, null, 2), 'utf8');
}
async function getReceivedAmount(transactionId, cryptoName, myAddress) {
  // Map cryptoName to blockchain and network
  const cryptoMap = {
    bitcoin: { blockchain: 'bitcoin', network: 'mainnet' },
    ethereum: { blockchain: 'ethereum', network: 'mainnet' },
    litecoin: { blockchain: 'litecoin', network: 'mainnet' },
  };

  if (!cryptoMap[cryptoName]) {
    throw new Error(`Unsupported cryptocurrency: ${cryptoName}`);
  }

  const { blockchain, network } = cryptoMap[cryptoName];

  try {
    // Call the getTransactionSummary function
    const transactionDetails = await getTransactionSummary(blockchain, network, transactionId);

    // Check if the specified address is among the recipients
    if (transactionDetails.receiverAddress === myAddress) {
      return {
        address: myAddress,
        amountReceived: transactionDetails.receiverAmount,
      };
    } else {
      return {
        address: myAddress,
        amountReceived: 0, // Address didn't receive anything
      };
    }
  } catch (error) {
    console.error('Error checking received amount:', error.message);
    throw error;
  }
}


// Handle Discord bot commands
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;
      const categoryIdSuccess = '1322787389676195930';
    const categoryIdFailure = '1322787366959841391';
    const middlemanRoleId = '1322706911048630344';
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args[0].toLowerCase();
  const user = message.author;
   const createTicket = async (categoryId, title, content) => {
      const guild = message.guild;
      const user = message.author;

      const channel = await guild.channels.create(`ticket-${user.username}-${Date.now()}`, {
        type: 'GUILD_TEXT',
        parent: categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: user.id,
            allow: ['VIEW_CHANNEL'],
          },
          {
            id: middlemanRoleId,
            allow: ['VIEW_CHANNEL'],
          },
        ],
      });
   const confirmationEmbed = new MessageEmbed()
    .setColor("#00000")
    .setDescription(`${title}
${content}`);

  await channel.send({ embeds: [confirmationEmbed], components: [] });

    
    };

  // Command to add a user to a ticket
// Command to add a user to a ticket
if (command === "claimtransaction") {
  const userId = message.author.id;

  // Ensure sufficient arguments are provided
  if (args.length < 2) {
    const user = message.author;
    await user.send('Please provide a transaction ID. For crypto, also include the type of cryptocurrency (e.g., bitcoin, litecoin, ethereum).')
      .catch(error => console.error('Failed to send DM:', error));
    message.delete();
    return;
  }

  // Check if the user has pending payments
  if (!pending[userId] || pending[userId].total === 0) {
    const user = message.author;
    await user.send('We couldn\'t find your transaction. Please contact support if this is a mistake or go through our purchase system.')
      .catch(error => console.error('Failed to send DM:', error));
    message.delete();
    return;
  }

  const { total, product } = pending[userId];
  const transactionId = args[1];
  let errors = [];
  let transactionDetailsMessage = '';

  // Determine if the user is in the PayPal or Crypto table
  if (pp[userId]) {
    // Handle PayPal transactions
    const transactionDetails = await checkPaypalTransactions(transactionId);

    try {
      const transactionInfo = transactionDetails.transaction_info;

      if (!transactionInfo || !transactionInfo.transaction_amount) {
        errors.push("`Invalid transaction details received`");
      } else {
        const transactionAmount = parseFloat(transactionInfo.transaction_amount.value);

        if (transactionAmount < total) {
          errors.push("`Not enough amount`");
        }
        if (transactionInfo.protection_eligibility !== '02') {
          errors.push("`Not F&F`");
        }
        if (transactionInfo.transaction_amount.currency_code !== 'USD') {
          errors.push("`Currency invalid`");
        }
      }

      // Transaction details message
      transactionDetailsMessage = `\`Transaction ID: ${transactionId}\`
      \`Amount: $${transactionInfo.transaction_amount.value}\`
      \`Product: ${product}\`
      \`Total: $${total}\`
      \`Date: ${new Date().toISOString()}\`
      `;

      if (errors.length > 0) {
        // Handle failed PayPal transactions
        await createTicket(categoryIdFailure, `Transaction Failed - ${transactionId}`, `
**Errors:**
${errors.map(error => `${error}`).join("\n")}

**Transaction Details:**
${transactionDetailsMessage}
-# Please wait for support to respond
        `);
        await message.author.send(`Your transaction has failed. The details of the errors are listed in the ticket.`);
      } else {
        // Handle successful PayPal transactions
        await createTicket(categoryIdSuccess, `Transaction Successful - ${transactionId}`, `
**Transaction Details:**
${transactionDetailsMessage}
-# Payment has been successfully processed.
        `);
        await message.author.send('Transaction successful! Your payment has been processed.');
      }
    } catch (error) {
      console.error('Error handling transaction:', error);
      await message.author.send('An error occurred while processing your transaction. Please contact support.');
    }
  } else if (crypto[userId]) {
    // Handle Crypto transactions
    if (args.length < 3) {
      const user = message.author;
      await user.send('Please provide the cryptocurrency type (e.g., bitcoin, litecoin, ethereum).')
        .catch(error => console.error('Failed to send DM:', error));
      message.delete();
      return;
    }

    const cryptoType = args[2].toLowerCase();
    const cryptoAddresses = {
      bitcoin: 'bc1qxq4vv4h2c7krvhcs0j8lr9nf94lr0e295nr0ue',
      litecoin: 'LiQt5uBKUABda7D3VKtzfZXbKReY2HPjCE',
      ethereum: '0xB68D67F2Ce53a577E9bB5f89aD29f44431753728',
    };

    const myAddress = cryptoAddresses[cryptoType];
    if (!myAddress) {
      const user = message.author;
      await user.send('Invalid cryptocurrency type. Please use bitcoin, litecoin, or ethereum.')
        .catch(error => console.error('Failed to send DM:', error));
      message.delete();
      return;
    }

    try {
      const cryptoDetails = await getReceivedAmount(transactionId, cryptoType, myAddress);

      if (cryptoDetails.amountReceived < total) {
        errors.push("`Not enough amount`");
      }

      // Transaction details message
      transactionDetailsMessage = `\`Transaction ID: ${transactionId}\`
      \`Amount Received: $${cryptoDetails.amountReceived}\`
      \`Product: ${product}\`
      \`Total: $${total}\`
      \`Date: ${new Date().toISOString()}\`
      `;

      if (errors.length > 0) {
        // Handle failed Crypto transactions
        await createTicket(categoryIdFailure, `Transaction Failed - ${transactionId}`, `
**Errors:**
${errors.map(error => `${error}`).join("\n")}

**Transaction Details:**
${transactionDetailsMessage}
-# Please wait for support to respond
        `);
        await message.author.send(`Your transaction has failed. The details of the errors are listed in the ticket.`);
      } else {
        // Handle successful Crypto transactions
        await createTicket(categoryIdSuccess, `Transaction Successful - ${transactionId}`, `
**Transaction Details:**
${transactionDetailsMessage}
-# Payment has been successfully processed.
        `);
        await message.author.send('Transaction successful! Your payment has been processed.');
      }
    } catch (error) {
      console.error('Error handling crypto transaction:', error);
      await message.author.send('An error occurred while processing your transaction. Please contact support.');
    }
  } else {
    const user = message.author;
    await user.send('We couldn\'t determine your payment method. Please contact support if this is a mistake.')
      .catch(error => console.error('Failed to send DM:', error));
  }

  message.delete(); // Delete the command message
}


  if (command === "checkpending") {
  let receive = getPendingPaymentsAsString(); // Call the function by adding parentheses
console.log(receive);
return message.channel.send(receive);
  }
  if (command === "setup2323") {
     const embedChecking = new MessageEmbed()
      .setColor("#000000")
      .setDescription(`We strive to automate our payment process to ensure efficiency. Please click **Purchase** and follow the provided instructions to complete your payment swiftly and seamlessly.

-# All your payments are secure and any errors will be followed with immediate support. `);
    const doneRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('purchase')
        .setLabel('Purchase')
        .setStyle('PRIMARY')
    );

   
 await message.channel.send({ embeds: [embedChecking], components: [doneRow] });
    
  }
  return
if (command === 'add') {
  const userId = message.author.id;

  // Check if the user has an open ticket
  if (!userTicketsData.users[userId]) {
    return message.channel.send('You do not have an open ticket.');
  }

  // Check if a user is already added
  if (userTicketsData.users[userId].dealer) {
    return message.channel.send('You have already added a user to this ticket.');
  }

  const targetUserId = args[1]; // Get the user ID to add
  const targetUser = await message.guild.members.fetch(targetUserId).catch(() => null); // Check if user exists

  if (!targetUser) {
    return message.channel.send(`User with ID ${targetUserId} not found in this server.`);
  }

  const ticketChannel = message.guild.channels.cache.find(c => c.name === userTicketsData.users[userId].ticketId);

  // Add permissions for the target user to view the ticket
  await ticketChannel.permissionOverwrites.edit(targetUser.id, { VIEW_CHANNEL: true });

  // Update the ticket with the added user
  userTicketsData.users[userId].dealer = targetUser.user.username;
  userTicketsData.users[userId].dealerId = targetUser.user.id; // Save the dealer's ID
  saveUserTickets();

  // First Embed: Set the user for the trade
   const confirmationEmbed = new MessageEmbed()
    .setColor("#0090fe")
    .setTitle("User Added to Ticket")
    .setDescription(`User ${targetUser.user.username} has been added to your ticket.`);

  await message.channel.send({ embeds: [confirmationEmbed], components: [] });
  
  const embed1 = new MessageEmbed()
    .setColor('#0090fe')
    .setTitle('**Set the User**')
    .setDescription(`Please set the user by using \`.setuser <username>\` to specify which Roblox account you are using to give the Dahood items.`);

  await ticketChannel.send({ embeds: [embed1] });

  // Second Embed: Join the trade
  const embed2 = new MessageEmbed()
    .setColor('#0090fe')
    .setTitle('**Join the Trade**')
    .setDescription(`Join this [server](https://www.roblox.com/home) and trade with **RobloxBotName**. Make sure to give the items you are trading.`);

  await ticketChannel.send({ embeds: [embed2] });

  // Third Embed: Click done once the trade is completed
  const embed3 = new MessageEmbed()
    .setColor('#0090fe')
    .setTitle('**Trade Completion**')
    .setDescription(`Once the trade has been completed, click the button below to indicate that you're done.`)
    .setFooter("These actions should only be completed by the ticket owner. Please make a new ticket if you are giving the Dahood items.");

  const doneRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('trade_done')
        .setLabel('Done')
        .setStyle('PRIMARY')
    );

  await ticketChannel.send({ embeds: [embed3], components: [doneRow] });

 
}

});
// Function to return all pending payments as a string


// Event listener for button interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

const userId = ""
const acceptedcryp = `
LTC \`LiQt5uBKUABda7D3VKtzfZXbKReY2HPjCE\` 
ETH \`0xB68D67F2Ce53a577E9bB5f89aD29f44431753728\`
BTC \`bc1qxq4vv4h2c7krvhcs0j8lr9nf94lr0e295nr0ue\`
SOL \`Gc5obKimoei6fSBkT9hqHSNgCm2ZtZHsDV3FV1rTinm2\`
`

if (interaction.customId === 'Crypto') {
  const userId = interaction.user.id;

  // Check if the user has an entry in the pending object
  if (pending[userId]) {
    const total = pending[userId].total;
    const product = pending[userId].product;
    if (total <= 0) {
        const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`something went wrong please try again or contact support`);
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: [] // This removes all buttons
    });
    return
    }
    
      const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`Please send a  payment of the amount due to one of our accepted cryptos. 

` + "`Amount due: $" + String(total) + "`" + `
`+acceptedcryp + `

Once you have completed the transaction please use the command using the following format. `+ "`.claimtransaction <transactionid> <bitcoin/litecoin/ethereum>`" + `

-# If your payment hasn’t been confirmed yet, we’ll forward you to support for assistance while we wait for it to process.`);
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: []// This removes all buttons
      
    });
    updateTables("crypto",userId);
  }

 else{
    const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`something went wrong please try again or contact support`);
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: [] // This removes all buttons
    });
  }
    
  
}


if (interaction.customId === 'Paypal') {
  const userId = interaction.user.id;

  // Check if the user has an entry in the pending object
  if (pending[userId]) {
    const total = pending[userId].total;
    const product = pending[userId].product;
    if (total <= 0) {
        const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`something went wrong please try again or contact support`);
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: [] // This removes all buttons
    });
    return
    }
    
      const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`Please send a fnf payment of the amount due [here](
https://paypal.me/paymefnf). 

` + "`Amount due: $" + String(total) + "`" + `

Once you have paid please copy the transaction ID of the payment and use the command ` + "`.claimtransaction <transactionid>`" + `

-# Any payments that are not received as friends & family will be flagged and will not be accepted. If our bot flags your payment as incorrect, we will issue a refund once a supervisor is available.`)
      .setImage("https://media.discordapp.net/attachments/1137161976699682906/1322769501259042837/image.png?ex=67721498&is=6770c318&hm=46b5b19b3cc556fbc2313ef3386d22176033dac0696c700f7ec74d7d327a6b6d&=&format=webp&quality=lossless&width=954&height=405");
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: []// This removes all buttons
      
    });
    updateTables("paypal",userId);
  }

 else{
    const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`something went wrong please try again or contact support`);
   await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
     components: [] // This removes all buttons
    });
  }
    
  
}
  
if (interaction.customId === 'beginners') {
  // Check if the user has the 'key' role
  pending[interaction.user.id] = {
    total: 0,
    product: 0 // This stores the 'beginners' button customId
  };

 const hasKeyRole = interaction.member.roles.cache.some(role => role.name === '🔑');

const total = interaction.member.roles.cache.some(role => role.name === 'key') ? 10 : 30;
const has = interaction.member.roles.cache.some(role => role.name === 'key') ? "have already" : "have not";

const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`Please choose your payment method or dismiss this message to cancel.

`+ "`Total Price : $" + String(total) + "`" + `

-# You ${has} paid the set up fee ($20)`);

  pending[interaction.user.id] = {
    total: total,
    product: interaction.customId // This stores the 'beginners' button customId
  };


 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('Paypal')
      .setLabel('Paypal')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('Crypto')
      .setLabel('Crypto')
      .setStyle('PRIMARY'),
  
  );

 await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
      components: [doneRow] // This removes all buttons
    });
    // The user has the 'key' role
   
}
   if (interaction.customId === 'purchase') {
    const embed = new MessageEmbed()
      .setColor('#00000') // You can customize the color
      .setDescription(`Please select the plan you would like to purchase.

-# Please note this purchase only covers a month.`);
 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('beginners')
      .setLabel('Beginners')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('champions')
      .setLabel('Champions')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('masters')
      .setLabel('Masters')
      .setStyle('PRIMARY')
  );
    

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [doneRow]
    });
   }

if (interaction.customId === 'champions') {
  // Check if the user has the 'key' role
  pending[interaction.user.id] = {
    total: 0,
    product: 0 // This stores the 'beginners' button customId
  };

 const hasKeyRole = interaction.member.roles.cache.some(role => role.name === '🔑');

const total = interaction.member.roles.cache.some(role => role.name === 'key') ? 15 : 35;
const has = interaction.member.roles.cache.some(role => role.name === 'key') ? "have already" : "have not";

const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`Please choose your payment method or dismiss this message to cancel.

`+ "`Total Price : $" + String(total) + "`" + `

-# You ${has} paid the set up fee ($20)`);

  pending[interaction.user.id] = {
    total: total,
    product: interaction.customId // This stores the 'beginners' button customId
  };


 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('Paypal')
      .setLabel('Paypal')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('Crypto')
      .setLabel('Crypto')
      .setStyle('PRIMARY'),
  
  );

 await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
      components: [doneRow] // This removes all buttons
    });
    // The user has the 'key' role
   
}
  
  if (interaction.customId === 'masters') {
  // Check if the user has the 'key' role
  pending[interaction.user.id] = {
    total: 0,
    product: 0 // This stores the 'beginners' button customId
  };

 const hasKeyRole = interaction.member.roles.cache.some(role => role.name === '🔑');

const total = interaction.member.roles.cache.some(role => role.name === 'key') ? 30 : 50;
const has = interaction.member.roles.cache.some(role => role.name === 'key') ? "have already" : "have not";

const updatedEmbed = new MessageEmbed()
  .setColor('#00000') // Set the color or any other properties you want to modify
  .setDescription(`Please choose your payment method or dismiss this message to cancel.

`+ "`Total Price : $" + String(total) + "`" + `

-# You ${has} paid the set up fee ($20)`);

  pending[interaction.user.id] = {
    total: total,
    product: interaction.customId // This stores the 'beginners' button customId
  };


 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('Paypal')
      .setLabel('Paypal')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('Crypto')
      .setLabel('Crypto')
      .setStyle('PRIMARY'),
  
  );

 await interaction.update({
      embeds: [updatedEmbed],
      ephemeral: true,
      components: [doneRow] // This removes all buttons
    });
    // The user has the 'key' role
   
}
   if (interaction.customId === 'purchase') {
    const embed = new MessageEmbed()
      .setColor('#00000') // You can customize the color
      .setDescription(`Please select the plan you would like to purchase.

-# please note this purchase only covers a month.`);
 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('beginners')
      .setLabel('Beginners')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('champions')
      .setLabel('Champions')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('masters')
      .setLabel('Masters')
      .setStyle('PRIMARY')
  );
    

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [doneRow]
    });
   }
  
  
   if (interaction.customId === 'purchase') {
    const embed = new MessageEmbed()
      .setColor('#00000') // You can customize the color
      .setDescription(`Please select the plan you would like to purchase.

-# please note this purchase only covers a month.`);
 const doneRow = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('beginners')
      .setLabel('Beginners')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('champions')
      .setLabel('Champions')
      .setStyle('PRIMARY'),
    
    new MessageButton()
      .setCustomId('masters')
      .setLabel('Masters')
      .setStyle('PRIMARY')
  );
    

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [doneRow]
    });
   }
  
  if (interaction.customId === 'create_ticket') {
    // Check if the user already has an open ticket
    if (userTicketsData.users[userId]) {
      return interaction.reply({ content: 'You already have an open ticket.', ephemeral: true });
    }

    const uniqueId = `ticket-${interaction.user.username}-${Date.now()}`; // Unique ID for the ticket
    const categoryId = '1287507253464666283'; // Your actual category ID

const middlemanRoleId = '1287457574710542417'; // Replace with your middleman role ID

const channel = await interaction.guild.channels.create(uniqueId, {
  type: 'GUILD_TEXT',
  parent: categoryId,
  permissionOverwrites: [
    {
      id: interaction.guild.id,
      deny: [Permissions.FLAGS.VIEW_CHANNEL],
    },
    {
      id: interaction.user.id,
      allow: [Permissions.FLAGS.VIEW_CHANNEL],
    },
    {
      id: middlemanRoleId, // Allow middleman role to view the channel
      allow: [Permissions.FLAGS.VIEW_CHANNEL],
    },
  ],
});

    // Store ticket info in userTicketsData
    userTicketsData.users[userId] = {
      ticketId: uniqueId,
      ticketHolder: interaction.user.username,
      status: 'waiting',
      dealer: null, // Dealer will be added later
      dealerId: null, // Dealer ID will be added later
      opened: true, // Track if the ticket is currently open
      paypalBalance: 0, // Add PayPal balance
      bitcoinBalance: 0, // Add Bitcoin balance
      robuxBalance: 0, // Add Robux balance
      dahoodItems: [], // Add Dahood items
    };
    saveUserTickets();

    await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });

    // First Embed: Information about the trade system
    const embed1 = new MessageEmbed()
      .setColor('#0090fe')
      .setTitle('**Dahood Trade**')
      .setDescription(`As the ticket holder, you will provide one of our automated clients with your Dahood items to hold during this middleman process. If the person you are dealing with is using one of our supported payment methods, this transaction will be fully automated in both directions. If not, it will remain one-way automated. Rest assured, your items are safe throughout the entire process!`);

    await channel.send({ embeds: [embed1] });

    // Second Embed: Ask who the user is trading with, include the "Close Ticket" button
    const embed2 = new MessageEmbed()
      .setColor('#0090fe')
      .setTitle('Who are you trading with?')
      .setDescription('Use `.add <UserId>` to add the user to this ticket.');

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle('PRIMARY')
      );

    await channel.send({ embeds: [embed2], components: [row] });
  }

  // Handle the 'done' button
  if (interaction.customId === 'done') {
    const ticketData = userTicketsData.users[userId];

    // Check if the user is the ticket owner
    if (!ticketData || ticketData.ticketHolder !== interaction.user.username) {
      return interaction.reply({ content: 'Only the ticket owner can confirm the transaction.', ephemeral: true });
    }

    const embed = new MessageEmbed()
      .setColor('#00ff00')
      .setTitle('Transaction Complete')
      .setDescription('We have received your items. Thank you for trading!');

    await interaction.update({ embeds: [embed], components: [] });

    // Additional logic can be added here if needed (e.g., logging the trade, closing the ticket, etc.)
  }

  // Handle the 'close_ticket' button
  if (interaction.customId === 'close_ticket') {
    // Check if the user is the ticket owner
    if (!userTicketsData.users[userId]) {
      return interaction.reply({ content: 'You do not own this ticket.', ephemeral: true });
    }

    const ticketData = userTicketsData.users[userId];

    // Create confirmation embed for closing the ticket
    const confirmationEmbed = new MessageEmbed()
      .setColor('#0090fe')
      .setTitle('Confirm Ticket Closure')
      .setDescription('Closing this ticket will not get you any items back. Please confirm your choice.');

    const confirmationRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('confirm_close')
          .setLabel('Confirm')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('request_support')
          .setLabel('Support')
          .setStyle('PRIMARY')
      );

    await interaction.reply({ embeds: [confirmationEmbed], components: [confirmationRow] });
  }

  // Handle the confirmation to close the ticket
  if (interaction.customId === 'confirm_close') {
    // Check if the user is the ticket owner
    if (!userTicketsData.users[userId]) {
      return interaction.reply({ content: 'You do not own this ticket.', ephemeral: true });
    }

    const ticketId = userTicketsData.users[userId].ticketId;
    const ticketChannel = interaction.guild.channels.cache.find(c => c.name === ticketId);

    // Log data to the specified channel before deletion
    const logChannelId = '1287423562784964670'; // Your actual log channel ID
    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (logChannel) {
      const ticketData = userTicketsData.users[userId];
      const dahoodItems = ticketData.dahoodItems.length
        ? ticketData.dahoodItems.map(item => `- ${item}`).join('\n')
        : 'No Dahood items';

      const logEmbed = new MessageEmbed()
        .setColor('#0090fe')
        .setTitle('Ticket Closed')
        .setDescription(`Ticket Holder: ${ticketData.ticketHolder} (${userId})\n` +
          `Dealer: ${ticketData.dealer ? `${ticketData.dealer} (${ticketData.dealerId || '0'})` : 'None (0)'}\n` +
          `PayPal Balance: $${ticketData.paypalBalance}\n` +
          `Bitcoin Balance: ${ticketData.bitcoinBalance} BTC\n` +
          `Robux Balance: ${ticketData.robuxBalance} Robux\n` +
          `Dahood Items:\n${dahoodItems}`);

      await logChannel.send({ embeds: [logEmbed] });
    }

    // Delete the ticket channel
    if (ticketChannel) await ticketChannel.delete();

    // Remove the user from the tickets list
    delete userTicketsData.users[userId];
    saveUserTickets();
  }
});

// Start Express server for webhook handling (optional)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

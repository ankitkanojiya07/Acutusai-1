const mysql = require('mysql2');
const fs = require('fs');
const csv = require('csv-parser');

// Create MySQL connection
const connection = mysql.createConnection({
    host: '193.203.184.105',       // Hostinger MySQL server IP
    user: 'u411184336_acutusaidb',  // Hostinger MySQL username
    password: 'AcutusaiDb111',      // Hostinger MySQL password
    database: 'u411184336_acutusaidb'  // Database where the rate card will be stored
});

// Create table (if not exists)
const createTableQuery = `
CREATE TABLE IF NOT EXISTS rate_card (
    id INT AUTO_INCREMENT PRIMARY KEY,
    LOI INT,
    IR VARCHAR(10),
    percent_1 VARCHAR(10),
    percent_2 VARCHAR(10),
    percent_3 VARCHAR(10),
    percent_4 VARCHAR(10),
    percent_5 VARCHAR(10),
    percent_6 VARCHAR(10),
    percent_7 VARCHAR(10),
    percent_8 VARCHAR(10),
    percent_9 VARCHAR(10),
    percent_10 VARCHAR(10),
    percent_15 VARCHAR(10),
    percent_20 VARCHAR(10),
    percent_25 VARCHAR(10),
    percent_30 VARCHAR(10),
    percent_40 VARCHAR(10),
    percent_50 VARCHAR(10),
    percent_60 VARCHAR(10),
    percent_70 VARCHAR(10),
    percent_80 VARCHAR(10),
    percent_90 VARCHAR(10),
    percent_100 VARCHAR(10)
);

`;

connection.query(createTableQuery, (err, results) => {
    if (err) {
        console.error("Error creating table:", err);
        return;
    }
    console.log("Table created or exists.");
});

// Parse CSV file and insert into database
fs.createReadStream('Card_OpinioMea.csv')
    .pipe(csv())
    .on('data', (row) => {
        // Construct insert query
        const insertQuery = `
            INSERT INTO rate_card (
                IR, percent_1, percent_2, percent_3, percent_4, percent_5,
                percent_6, percent_7, percent_8, percent_9, percent_10, percent_15,
                percent_20, percent_25, percent_30, percent_40, percent_50, percent_60,
                percent_70, percent_80, percent_90, percent_100
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        
        const values = [
            row['IR'], 
            parseFloat(row['1%']) || 0, 
            parseFloat(row['2%']) || 0, 
            parseFloat(row['3%']) || 0,
            parseFloat(row['4%']) || 0, 
            parseFloat(row['5%']) || 0, 
            parseFloat(row['6%']) || 0, 
            parseFloat(row['7%']) || 0, 
            parseFloat(row['8%']) || 0,
            parseFloat(row['9%']) || 0, 
            parseFloat(row['10%']) || 0, 
            parseFloat(row['15%']) || 0,
            parseFloat(row['20%']) || 0, 
            parseFloat(row['25%']) || 0, 
            parseFloat(row['30%']) || 0,
            parseFloat(row['40%']) || 0, 
            parseFloat(row['50%']) || 0, 
            parseFloat(row['60%']) || 0,
            parseFloat(row['70%']) || 0, 
            parseFloat(row['80%']) || 0, 
            parseFloat(row['90%']) || 0, 
            parseFloat(row['100%']) || 0
        ];

        // Execute insert query
        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                return;
            }
            console.log("Row inserted:", result.insertId);
        });
    })
    .on('end', () => {
        console.log('CSV file successfully processed.');
        connection.end();  // Close the connection
    });

const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const app = express();

// Use CORS and allow requests from localhost:3000
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests only from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true, // Allow credentials if needed (e.g., for cookies)
}));

app.use(express.json()); // for passing data in JSON

// Create MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "farms"
});

// Test route
app.get("/", (req, res) => {
    const sql = "SELECT * FROM employees"; // Use correct table name (case-sensitive)
    db.query(sql, (err, data) => {
        if (err) return res.json("Error");
        return res.json(data);
    });
});

// Create Employee route
app.post('/create', (req, res) => {
    const sql = "INSERT INTO employees (`firstName`, `lastName`, `DateOfBirth`, `gender`, `email`, `phoneNumber`, `salary`, `address`, `locationAssigned`) VALUES (?)";
    
    const values = [
        req.body.firstName,
        req.body.lastName, // Correct the typo
        req.body.DateOfBirth,
        req.body.gender,
        req.body.email,
        req.body.phoneNumber,
        req.body.salary,
        req.body.address,
        req.body.locationAssigned
    ];
    
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error(err);  // Log the actual error
            return res.json({ error: "An error occurred" });
        }
        return res.json(data);
    });
});


//to update 
app.put('/update/:id', (req, res) => {
    const sql = `
    UPDATE employees 
    SET firstName = ?, lastName = ?, DateOfBirth = ?, gender = ?, email = ?, phoneNumber = ?, salary = ?, address = ?, locationAssigned = ? 
    WHERE id = ?
`;
    
    const values = [
        req.body.firstName,
        req.body.lastName, // Correct the typo
        req.body.DateOfBirth,
        req.body.gender,
        req.body.email,
        req.body.phoneNumber,
        req.body.salary,
        req.body.address,
        req.body.locationAssigned
    ];
    const id = req.params.id;
    db.query(sql, [...values, id], (err, data) => {
        if (err) {
            console.error(err);  // Log the actual error
            return res.json({ error: "An error occurred" });
        }
        return res.json(data);
    });
});


//TO DELETE
app.delete('/employees/:id', (req, res) => {
    const sql = "DELETE FROM employees WHERE ID = ?";
    const id = req.params.id;
    db.query(sql, [id], (err, data) => {
        if (err) {
            console.error(err);  // Log the actual error
            return res.json({ error: "An error occurred" });
        }
        return res.json(data);
    });
});


//for sales
//to create
app.post('/createsales', (req, res) => {
    const sql = "INSERT INTO sales (`SaleDate`, `CustomerNAme`, `Product`, `Quantity`, `UnitPrice`) VALUES (?)";
    
    const values = [
        req.body.SaleDate,
        req.body.CustomerName, // Correct the typo
        req.body.Product,
        req.body.Quantity,
        req.body.UnitPrice
    ];
    
    db.query(sql, [values], (err, data) => {
        if (err) {
            console.error(err);  // Log the actual error
            return res.json({ error: "An error occurred" });
        }
        return res.json(data);
    });
});

//for sales
app.get("/salesdata", (req, res) => {
    // Get the current date and the first day of the month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Query to get sales data for today
    const salesQuery = `
        SELECT Product, SUM(Quantity * UnitPrice) AS total_sales, SUM(Quantity) AS total_quantity
        FROM sales 
        WHERE SaleDate = CURDATE()
        GROUP BY Product;
    `;

    // Query to get total sales and quantity for today
    const todayTotalQuery = `
        SELECT SUM(Quantity * UnitPrice) AS total_sales, SUM(Quantity) AS total_quantity 
        FROM sales 
        WHERE SaleDate = CURDATE();
    `;

    // Query to get total sales and quantity for the current month
    const monthlyTotalQuery = `
        SELECT SUM(Quantity * UnitPrice) AS total_sales, SUM(Quantity) AS total_quantity 
        FROM sales 
        WHERE SaleDate >= ?;
    `;

    // Execute the queries
    db.query(salesQuery, (err, salesData) => {
        if (err) return res.json({ error: "Error fetching sales data" });

        // Get total sales and quantity for today
        db.query(todayTotalQuery, (err, todayData) => {
            if (err) return res.json({ error: "Error fetching today's total sales" });

            const todayTotalSales = todayData[0]?.total_sales || 0;
            const todayTotalQuantity = todayData[0]?.total_quantity || 0;

            // Get total sales and quantity for the current month
            db.query(monthlyTotalQuery, [startOfMonth], (err, monthlyData) => {
                if (err) return res.json({ error: "Error fetching monthly total sales" });

                const monthlyTotalSales = monthlyData[0]?.total_sales || 0;
                const monthlyTotalQuantity = monthlyData[0]?.total_quantity || 0;

                // Send the response with all calculated data
                res.json({
                    salesData,
                    todayTotalSales,
                    todayTotalQuantity,
                    monthlyTotalSales,
                    monthlyTotalQuantity,
                });
            });
        });
    });
});


    
  
    
  



// Start server
app.listen(8081, () => {
    console.log("Server is running on port 8081");
});

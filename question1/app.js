const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const windowSize = 10;
let numbersStore = [];

// Utility to fetch numbers from the test server
async function fetchNumbers(type) {
    const urls = {
        'p': 'http://20.244.56.144/test/primes',
        'f': 'http://20.244.56.144/test/fibo',
        'e': 'http://20.244.56.144/test/even',
        'r': 'http://20.244.56.144/test/rand'
    };

    try {
        const response = await axios.get(urls[type], { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        console.error('Failed to fetch or timeout', error);
        return [];
    }
}

app.get('/numbers/:numberId', async (req, res) => {
    const { numberId } = req.params;

    // Check if numberId is valid
    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).send({ error: 'Invalid number ID provided.' });
    }

    // Fetch new numbers
    const newNumbers = await fetchNumbers(numberId);

    // Prepare response
    const windowPrevState = [...numbersStore];
    numbersStore = [...new Set([...numbersStore, ...newNumbers])].slice(-windowSize);

    const avg = numbersStore.length > 0
        ? numbersStore.reduce((acc, curr) => acc + curr, 0) / numbersStore.length
        : 0;

    res.json({
        windowPrevState,
        windowCurrState: numbersStore,
        numbers: newNumbers,
        avg: avg.toFixed(2)
    });
});

app.listen(port, () => {
    console.log(`Average Calculator Service running on http://localhost:${port}`);
});

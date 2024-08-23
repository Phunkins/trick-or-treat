import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { ethAddress, twitterHandle } = req.body;

        // Define the path to the JSON file
        const filePath = path.join(process.cwd(), 'data', 'submissions.json');

        // Read the existing data from the JSON file
        let fileData = [];
        if (fs.existsSync(filePath)) {
            const jsonData = fs.readFileSync(filePath, 'utf-8');
            fileData = JSON.parse(jsonData);
        }

        // Add the new data
        fileData.push({
            ethAddress,
            twitterHandle,
            timestamp: new Date().toISOString()
        });

        // Write the updated data back to the JSON file
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

        // Respond with a success message
        res.status(200).json({ message: 'Data saved successfully' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

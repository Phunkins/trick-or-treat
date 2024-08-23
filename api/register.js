import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { ethAddress, twitterHandle } = req.body;

            // Define the path to the JSON file
            const filePath = path.join(process.cwd(), 'data', 'submissions.json');

            // Initialize an empty array for file data
            let fileData = [];

            // If the file exists, read its contents
            if (fs.existsSync(filePath)) {
                const jsonData = fs.readFileSync(filePath, 'utf-8');
                fileData = JSON.parse(jsonData);
            }

            // Add the new submission to the data array
            fileData.push({
                ethAddress,
                twitterHandle,
                timestamp: new Date().toISOString()
            });

            // Write the updated data array back to the JSON file
            fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

            // Respond with a success message
            res.status(200).json({ message: 'Data saved successfully' });
        } catch (error) {
            console.error('Error saving data:', error);
            res.status(500).json({ message: 'Error saving data', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

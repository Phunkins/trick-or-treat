export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { ethAddress, twitterHandle } = req.body;

        console.log('Received ETH Address:', ethAddress);
        console.log('Received Twitter Handle:', twitterHandle);

        res.status(200).json({ message: 'Data received successfully' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

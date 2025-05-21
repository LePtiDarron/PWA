const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const express = require('express');
const router = express.Router();

const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    res.status(400).json({ error: 'Missing fields' });
  }

  const command = new InvokeAgentCommand({
    agentId: 'WWMEMQTSYD',
    agentAliasId: 'VORL3ZXZ5P',
    sessionId: sessionId,
    inputText: message,
  });

  try {
    let completion = "";
    const response = await client.send(command);

    for await (const chunkEvent of response.completion) {
      const bytes = chunkEvent.chunk?.bytes;
      if (bytes) {
        const decoded = new TextDecoder('utf-8').decode(bytes);
        completion += decoded;
      }
    }
    res.status(response.$metadata?.httpStatusCode || 200).json({ sessionId, message: completion });
  } catch (err) {
    console.error('Error Bedrock agent:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

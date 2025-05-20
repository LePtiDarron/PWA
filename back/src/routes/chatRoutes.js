const { BedrockAgentRuntimeClient, InvokeAgentCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();

const client = new BedrockAgentRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post('/', async (req, res) => {
  const message = req.body.message;
  const sessionId = uuidv4();

  const command = new InvokeAgentCommand({
    agentId: 'WWMEMQTSYD',
    agentAliasId: 'VORL3ZXZ5P',
    sessionId,
    inputText: message,
  });

  try {
    let completion = "";
    const response = await client.send(command);

    for await (const chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk;
      const decodedResponse = new TextDecoder('utf-8').decode(chunk.bytes);
      completion += decodedResponse;
    }

    res.json({ sessionId, message: completion });
  } catch (err) {
    console.error('Error Bedrock agent:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const { BedrockAgentRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const client = new BedrockAgentRuntimeClient({ region: 'eu-west-3' });

router.post('/', async (req, res) => {
  const message = req.body.message;

  const input = {
    agentId: 'WWMEMQTSYD',
    agentAliasId: 'VORL3ZXZ5P',
    sessionId: uuidv4(),
    input: {
      text: message
    }
  };

  try {
    const command = new ConverseCommand(input);
    const response = await client.send(command);

    const reply = response?.output?.text || "Error";
    res.json({ message: reply });
  } catch (err) {
    console.error('Error Bedrock agent:', err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;

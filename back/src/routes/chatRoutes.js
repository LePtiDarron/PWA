const { BedrockAgentRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const express = require('express');
const router = express.Router();

const client = new BedrockAgentRuntimeClient({ region: 'eu-north-1' });

router.post('/', async (req, res) => {
  const message = req.body.message;
  const sessionId = `user-${Date.now()}`;

  const input = {
    agentId: 'IZXGEVCPGS',
    agentAliasId: 'TSTALIASID',
    sessionId,
    input: {
      text: message
    }
  };

  try {
    const command = new ConverseCommand(input);
    const response = await client.send(command);

    const reply = response?.output?.text || "Désolé, je n'ai pas compris.";
    res.json({ message: reply });
  } catch (err) {
    console.error('Error Bedrock agent:', err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;

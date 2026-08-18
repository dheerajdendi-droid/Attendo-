const { OAuth2Client } = require("google-auth-library");

// Thin wrapper around google-auth-library so tests can stub the network call
// by reassigning this module's export, without fighting module-mocking
// across CJS/node_modules boundaries.
async function verifyGoogleToken(credential, clientId) {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
  return ticket.getPayload();
}

module.exports = { verifyGoogleToken };

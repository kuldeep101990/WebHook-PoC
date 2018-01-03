# Secure WebHook PoC
This is a Proof of Concept to show how does work WebHooks in a real scenario, this PoC contains an exhaustive security schema generating a public key and semi-public key that contains the private key.

If you see server code, you will find code to implement AES and Steganography to hide data in png images.

## Encryption process

### Precedents:
* API route to refresh generated token
* Sample images to inject the key
* A method to inject the key in image (this project will be used: [Invoke-PSImage](https://github.com/peewpw/Invoke-PSImage))
* Key and IV generator to implement AES ([Advanced Encryption Standard](https://es.wikipedia.org/wiki/Advanced_Encryption_Standard))

### Steps

1. Start Server
2. Generate public key
3. Refresh token:
	1. Read a template to be injected (inject a ps1 file)
	2. Change Key and IV to generated keys
	3. Execute Invoke-PSImage.ps1 to inject the template
	4. Inject template
	5. Upload image in a public server (imgur in this case)
	6. Generate a code to extract data in endpoint
	7. Obfuscate code returned
	8. Encrypt obfuscated code with public key
	9. Return semi-public key
4. Save in memory

### Why inject a PowerShell script in a image file?
Well, this is only for illustrate that everything can be injected in a file to implement steganography, you can inject a json, encrypted file, another image and so on.. Only modify Invoke-PSImage or create your own program to inject data.

## Decryption process

### Precedents:
* API server that returns the public and semi-public key
* Semi-public key generated

### Steps
1) Request API Server to get public key
2) Request API Server to get semi-public key
3) Decrypt semi-public key with public key
4) Deobfuscate data
5) Execute PowerShell script to download image
6) Pixel caving to get injected script
7) Execute hidden function
8) Get private Key and IV
9) Digest data to use in future

### Webhooks

Finally, when both parties are ready with their corresponding keys the client needs to authenticate to create a webhook communication.

### Subscribing webhook listener
1) Client (listener) request API Server if can subscribe their IP.
2) API Server receive request and response an encrypted message with private key
3) Client receive encrypted key and try to decrypt message
4) Client read decrypted message
5) If data isn't corrupt request to API Server to subscribe IP
6) API Server receive the request and save their IP and encrypt it.
7) Client is ready to listen webhooks

### Sending webhook message
1) An event launch an API route to post message to listeners
2) API Server deliver the message to all subscribers
3) Listener receive their message and try to decrypt information
4) If decrypted message correspond to know message show a succesful message and related action in console (do some action)
5) If decrypted message is corrupted close server.

## To do
* Implement an authentication method to get public key
* Modify Invoke-PSImage to save a json file and not another PS1 file
* Remove callback use
* Clean code in listener
* Auto-refresh semi-public token
* Deprecate fixed obfuscation code and develop more random code
* Do more actions to listen webhooks (only accept 'Hello' message)
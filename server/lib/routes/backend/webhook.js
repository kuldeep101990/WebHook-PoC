function webhook(dependencies) {
	const _console = dependencies.console;
	const cross = dependencies.cross;
	const request = dependencies.request;
	const _token = dependencies.token

	var subscribers = [];

	const subscribe = function (req, res) {
		if (req.params.ip) {
			subscribers.push({ ip: req.params.ip });
			_console.success('Server', `${req.params.ip} is subscribed succesfuly`);
			res.json({ success: true, message: 'IP subscribed succesfuly', data: null });
		}
		else {
			res.json({ success: false, message: 'Something was wrong while subscripting a new subscriber IP', data: null });
		}
	}

	const postAction = function (req, res) {
		if (subscribers.length > 0) {
			var result = [];

			for (let i = 0; i < subscribers.length; i++) {
				const subscriber = subscribers[i];

				request.post(`http://${subscriber.ip}/webhook/${req.params.message}`, {
					form: {
						message: _token.encryptWithPrivateSign(req.params.message)
					}
				},
					function (error, response, body) {
						if (error) {
							res.json({ success: false, message: error, data: null });
						}
						else {
							if (response && response.statusCode == 200) {
								result.push({ ip: subscriber.ip, delivered: true });
							}
							else {
								result.push({ ip: subscriber.ip, delivered: false })
							}
						}
					});
			}

			res.json({ success: true, message: 'Delivery is end', data: result });
		}
		else {
			res.json({ success: false, message: 'Subscribe at least one IP', data: null });
		}
	}

	return {
		subscribe: subscribe,
		postAction: postAction,
	}
}

module.exports = webhook;
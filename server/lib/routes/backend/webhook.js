function webhook(dependencies) {
	const _console = dependencies.console;
	const cross = dependencies.cross;
	const request = dependencies.request;

	var subscribers = [];

	const subscribe = function (req, res) {
		if (req.params.ip) {
			subscribers.push(req.params.ip);
			res.json({ success: true, message: 'IP subscribed succesfuly', data: null });
		}
		else {
			res.json({ success: false, message: 'Something was wrong while subscripting a new subscriber IP', data: null });
		}
	}

	const postAction = function (req, res) {

		if (subscribers.length > 0) {
			var result = [];
			var i = 0;
			subscribers.forEach(subscriber => {
				if (i >= subscribers.length) {
					res.json({ success: true, message: 'Delivery is end', data: result });
				}
				else {
					request({
						method: 'POST',
						uri: `http://${subscriber.ip}/post`,
						multipart: [
							{
								'content-type': 'application/json',
								body: JSON.stringify({
									foo: 'bar',

								})
							}
						]
					},
						function (error, response, body) {
							if (response.statusCode == 200) {
								result.push({ ip: subscriber.ip, delivered: true });
							}
							else {
								result.push({ ip: subscriber.ip, delivered: true })
							}
							i++;
						});
				}

			});
		}
		else {
			res.json({ success: false, message: 'Subscribe at least one IP', data: null });
		}
	}

	return {
		subscribe: subscribe
	}
}

module.exports = webhook;
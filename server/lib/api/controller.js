function API(dependencies) {
	
	const _status = require(`${dependencies.root}/lib/routes/backend/status`)(dependencies);
	const _token = require(`${dependencies.root}/lib/routes/backend/token`)(dependencies);

	/// Dependencies
	const _console = dependencies.console;
	const _app = dependencies.app;
	const _express = dependencies.express;
	const _cross = dependencies.cross;

	var _apiRoutes;

	const constructor = () => {
		_apiRoutes = _express.Router();

		createAPI();

		_console.success('Server', 'API routes module initialized');
	}

	const createAPI = () => {
		
		_apiRoutes.get('/Status', _status.get);

		/// Add some many routes
		_apiRoutes.get('/token/refresh', _token.refresh);

		// apply the routes to our application with the prefix /api
		_app.use('/api', _apiRoutes);

		// Something else route response a 404 error
		_apiRoutes.get('*', function (req, res) {
			res.status(404).send('This API is not fully armed and operational... Try another valid route.');
		});
	}

	return {
		Initialize: constructor
	}
}

module.exports = API;
function MainServer(dependencies) {

	var _app = dependencies.app;

	// Modules
	const _cross = dependencies.cross;
	const _console = require('../lib/console/controller')(dependencies);


	const constructor = (next) => {
		dependencies.console = _console;

		const _apiController = require('../lib/api/controller')(dependencies);
		_apiController.Initialize();
		dependencies.api = _apiController;

		const _frontendController = require('../lib/frontend/controller')(dependencies);
		_frontendController.Initialize();

		_console.success('Server', 'Modules initialized');
		next();
	}

	return {
		Initialize: constructor
	}
}

module.exports = MainServer;
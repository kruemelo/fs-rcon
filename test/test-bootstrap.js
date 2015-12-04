require.config({
	paths: {
		chai: '/node_modules/chai/chai',
		'es6-promise-polyfill': '/node_modules/es6-promise-polyfill/promise'
	},
	baseUrl: '/'
});

mocha.setup({
    ui: 'bdd'
});

require([
	testPathname,
	'es6-promise-polyfill'
], function (testPath, Promise) {

	// Promise polyfill for phantom
	window.Promise = Promise;
	
	if (window.mochaPhantomJS) {
		mochaPhantomJS.run();
	}
	else {
		mocha.run();
	}
	
});
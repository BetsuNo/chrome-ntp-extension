const { FuseBox, Sparky, CSSPlugin, CSSResourcePlugin, EnvPlugin, JSONPlugin, QuantumPlugin, SassPlugin, WebIndexPlugin } = require('fuse-box');

let isProduction, fuse, app, vendor;

Sparky.task('clean', async () => {
	await Sparky.src('.fusebox/').clean('.fusebox/').exec();
	await Sparky.src('build/').clean('build/').exec();
	await Sparky.src('src/manifest.json').dest('build/$name').exec();
});

Sparky.task('config', ['clean'], () => {
	fuse = FuseBox.init({
		homeDir: 'src',
		sourceMaps: !isProduction,
		hash: isProduction,
		output: 'build/assets/$name.js',
		plugins: [
			EnvPlugin({NODE_ENV: isProduction ? 'production' : 'devel'}),
			WebIndexPlugin({
				template: 'src/index.tpl.html',
				path: 'assets',
				target: '../index.html'
			}),
			[
				SassPlugin(),
				CSSResourcePlugin({
					dist: 'build/assets/resources',
				}),
				CSSPlugin(),
			],
			JSONPlugin(),
			isProduction && QuantumPlugin({
				removeExportsInterop: false,
				uglify: true
			}),
		],
	});

	// vendor
	vendor = fuse.bundle('vendor')
	             .target('browser')
	             .instructions('~ app.tsx');

	// bundle app
	app = fuse.bundle('app')
	          .target('browser')
	          .instructions('> [app.tsx]');
});


Sparky.task('watch', ['config'], () => {
	// development server for hot reload
	fuse.dev({
		port: 9006,
		httpServer: false,
	});
	vendor.hmr().watch();
	app.hmr().watch();
	return fuse.run().then();
});

Sparky.task('prod-env', ['clean'], () => { isProduction = true });

Sparky.task('default', ['build'], () => {});

Sparky.task('build', ['prod-env', 'config'], () => {
	return fuse.run();
});
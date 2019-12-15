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
		output: 'build/$name.js',
		plugins: [
			EnvPlugin({NODE_ENV: isProduction ? 'production' : 'devel'}),
			[
				SassPlugin({
					sourceMap: `bundle-static.css.map`,
					outFile: ''
				}),
				CSSResourcePlugin({
					dist: 'build/resources',
					resolve: f => `/resources/${f}`,
				}),
				CSSPlugin({
					inject: file => `/bundle-static.css`,
					outFile: file => `./build/bundle-static.css`
				}),
			],
			WebIndexPlugin({
				template: 'src/index.tpl.html',
			}),
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
		socketURI: "ws://pma:4444",
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
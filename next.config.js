const { i18n } = require('./next-i18next.config')
const { PyodidePlugin } = require("@pyodide/webpack-plugin")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  staticPageGenerationTimeout: 300,
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    if (!dev && isServer) {
      config.output.webassemblyModuleFilename = "chunks/[id].wasm";
      config.plugins.push(new WasmChunksFixPlugin());
    }

    // Add the PyodidePlugin to the plugins array
		if (!isServer) {
			config.plugins.push(new PyodidePlugin())
			// Replace node-fetch with an empty module on the client side, since it's not used there
			config.resolve.alias["node-fetch"] = false
		}
		if (isServer) {
			// Do not include Pyodide in the server-side bundle
			config.externals = ["pyodide", ...(config.externals || [])]
		}

    return config;
  },
  experimental: {
    outputFileTracingIncludes: {
      '**': ['./**/*.wasm'],
    },
  },
  i18n,
}

module.exports = nextConfig

// Workaround from https://github.com/vercel/next.js/issues/29362#issuecomment-971377869
class WasmChunksFixPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("WasmChunksFixPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "WasmChunksFixPlugin" },
        (assets) =>
          Object.entries(assets).forEach(([pathname, source]) => {
            if (!pathname.match(/\.wasm$/)) return;
            compilation.deleteAsset(pathname);

            const name = pathname.split("/")[1];
            const info = compilation.assetsInfo.get(pathname);
            compilation.emitAsset(name, source, info);
          })
      );
    });
  }
}

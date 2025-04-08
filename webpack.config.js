const path = require("path");

module.exports = {
    entry: "./script.js", // Entry point for your application
    output: {
        filename: "bundle.js", // Output file name
        path: path.resolve(__dirname, "dist"), // Output directory
    },
    mode: "development", // Set mode to 'development' for easier debugging
    module: {
        rules: [
            {
                test: /\.js$/, // Apply this rule to JavaScript files
                exclude: /node_modules/, // Exclude node_modules directory
                use: {
                    loader: "babel-loader", // Use Babel to transpile modern JavaScript
                    options: {
                        presets: ["@babel/preset-env"], // Use the preset for modern JavaScript
                    },
                },
            },
        ],
    },
    devtool: "source-map", // Generate source maps for easier debugging
};

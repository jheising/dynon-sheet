const path = require("path");

const PATHS = {
    src: path.resolve(__dirname, "src"),
    build: path.resolve(__dirname, "dist")
};

module.exports = {
    watchOptions: {
        ignored: [/node_modules/]
    },
    entry: {
        "dynon-sheet": PATHS.src + "/DynONSheetApp.tsx",
        vendor: [
            "babel-polyfill"
        ]
    },
    node: {
        fs: "empty"
    },
    devtool: "source-map",
    output: {
        path: PATHS.build,
        filename: "[name].js",
        chunkFilename: '[name].chunk.js',
        publicPath: "dist/"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        reportFiles: ["!*.ts", "!*.tsx"] // Skips error output, for now
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    "file-loader?name=[name].[ext]"
                ]
            },
            {
                test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "fonts/",    // where the fonts will go
                        publicPath: "../"       // override the default path
                    }
                }]
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".eot"]
    }
};
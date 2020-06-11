import { terser } from 'rollup-plugin-terser';

var buildSources = ["src/background/main.js", "src/contentScript/contentScript.js", "src/updationPopup/updation.js"];

const rollupDevObjects = buildSources.map(getDevBuildObject);
const rollupProdObjects = buildSources.map(getProdBuildObject);

export default rollupDevObjects.concat(rollupProdObjects);

function getDevBuildObject(source) {
    return {
        input: source,
        output: {
            file: 'debugBuilds/' + getSourceFileName(source) + ".js",
            format: 'iife',
            strict: false
        }
    };
}

function getProdBuildObject(source) {
    return {
        input: source,
        output: {
            file: 'builds/' + getSourceFileName(source) + ".min.js",
            format: 'iife',
            strict: false
        },
        plugins: [terser()]
    };
}

function getSourceFileName(path) {
    const splitPath = path.split("/");
    return splitPath[splitPath.length - 1].replace(".js", "");
}
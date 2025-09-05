module.exports = {
    preset: "jest-puppeteer",
    reporters: [
        "default",
        ["jest-junit", {
            outputDirectory: "./test-reports",
            uniqueOutputName: "false",
            reportTestSuiteErrors: "true",
            includeConsoleOutput: "true",
            classNameTemplate: "{classname}-{title}",
            titleTemplate: "{classname}-{title}",
            ancestorSeparator: " › ",
            usePathForSuiteName: "true"
        }],
        ["jest-html-reporters", {
            "pageTitle": "Test Results",
            "publicPath": "./html-report",
            "filename": "jest_html_report.html",
            "expand": true,
            "openReport": false,
            "enableMergeData": true,
            "hideIcon": true
        }]],
}
# SVEN End-to-End Testing

Runs a set of test suites using Puppeteer (Headless Chrome) against the SVEN environments.  The goal is to easily confirm two-way and n-way calls are working after a deploy.

## Running

Run the test suite using some environment variables.

Using the `tca` environment as an example, the following `.env` files are supported.  Precedence will be top down, so `.env` has lowest priority and `SYSTEM` has highest.

```
.env
.env.local
.env.tca
.env.tca.local
SYSTEM
```

`.env*.local` files will not be versioned controlled.  You may create and commit
a `.env.tca` file, but most of the variables are secret values.

Let's create the environment variables for each environment that needs testing.

```
cp .env.sample .env.tca.local
```

Run with the `tca` environment variables.

```
SETTINGS=tca yarn run test
```

Run with the `tca` environment variables, but override the URL.

```
SETTINGS=tca URL=https://sven-url/ yarn run test
```

If you will only be running this test suite against a single environment, such as your local docker instance, then you can just copy `.env.sample` to `.env.local` and run without a SETTINGS, which defaults to `.env.local` or `.env`.

```
yarn run test
```

## Docker

### Build

```
docker build -t sven-e2e:latest .
```

### Run

```
docker run -it --init --rm --cap-add=SYS_ADMIN -w="/app" -e "CI=true" -e "SETTINGS=tca" -v /path/to/sven-e2e:/app sven-e2e:latest yarn run test
```
### Test Suites:

```
yarn run <test-suite-name> 

test: "JEST_JUNIT_OUTPUT_NAME=\"nway-call.xml\" jest src/nway-call.spec.js || true && JEST_JUNIT_OUTPUT_NAME=\"outbound-pstn.xml\" jest src/outbound-pstn.spec.js",

test:smokeCSR: "JEST_JUNIT_OUTPUT_NAME=\"smokeCSR.xml\" jest src/csrToCsrCalls.spec.js src/csrToTerpCalls.spec.js",

test:nway+pstn: "JEST_JUNIT_OUTPUT_NAME=\"nway+pstn.xml\" jest src/nway-call.spec.js src/outboundPstn.spec.js",

test:regression: "JEST_JUNIT_OUTPUT_NAME=\"regression.xml\" jest", 
```
### Reporter:

Setup includes Jest test reporter: <b>JEST-JUNIT </b>(https://www.npmjs.com/package/jest-junit)
Which generates Junit formatted xml test reports. Format was picked because of wide support by CI and Zephyr Jira plugin.

In case of need to change format of test results we can use any other reporter.

### Troubleshooting:

```
"jest not found" - yarn install (on host or container)
```
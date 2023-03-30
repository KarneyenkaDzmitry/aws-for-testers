# The POC of integration TestRailAPI with TAF

## Workflow

### From TAF side:
1. ID of the test case that corresponds to TesRail test case_id
2. The status of the test case execution

### From the TestRail API

#### Preconditions: in Env
 - ENV.TESTRAIL_RUN_ID
 - ENV.TESTRAIL_USERNAME
 - ENV.TESTRAIL_PASSWORD
 - ENV.TESTRAIL_HOST
 - ENV.TESTRAIL_PORT
1. Get Tests list in a run
2. Match TestRail case_id with TestRail with tests[].id
3. Update the Test by TestId with its status ()

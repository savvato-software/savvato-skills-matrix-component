#!/bin/bash

# Check if user is logged in
if npm whoami &> /dev/null; then
    echo "NPM login verified. Continuing..."
else
    echo "You need to run 'npm login' first. Aborting the script."
    exit 1
fi

GIT='git --git-dir='$PWD'/.git'

$GIT restore ./package.json ./projects/savvato-skills-matrix-services/package.json

rm dist/ -rf && cd projects/savvato-skills-matrix-services/ && npm version patch && cd - && ng build savvato-skills-matrix-services && cd dist/savvato-skills-matrix-services/ && npm pack && cd - && date

cd ~/src/savvato-skills-matrix-services/ && cd dist/savvato-skills-matrix-services && npm publish && cd -

$GIT add ./projects/savvato-skills-matrix-services/package.json
$GIT commit ./projects/savvato-skills-matrix-services/package.json -m "Bumped version number"

date

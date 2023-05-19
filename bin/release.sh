#!/bin/bash

    npm login
    cd ~/src/savvato-skills-matrix-component/projects/savvato-skills-matrix-component/ && npm version patch && cd - && rm dist/ -rf && ng build savvato-skills-matrix-component && cd dist/savvato-skills-matrix-component/ && npm pack && cd - && date

    cd ~/src/savvato-skills-matrix-component/ && cd dist/savvato-skills-matrix-component && npm publish




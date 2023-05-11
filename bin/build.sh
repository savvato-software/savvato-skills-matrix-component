#!/bin/bash

    cd projects/savvato-skills-matrix-component/ && npm version patch && cd - && rm dist/ -rf && ng build savvato-skills-matrix-component && cd dist/savvato-skills-matrix-component/ && npm pack && cd - && date

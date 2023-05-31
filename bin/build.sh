#!/bin/bash

    rm dist/ -rf && ng build savvato-skills-matrix-component && cd projects/savvato-skills-matrix-component/ && npm version patch && cd - && cd dist/savvato-skills-matrix-component/ && npm pack && cd - && date

#!/bin/sh -l

# $1 is the who-to-greet value — action.yml's args: maps inputs.who-to-greet to
# the container's $1, the same way any CLI tool reads positional arguments.
# TODO: use $1 here, e.g. echo "Hello $1"

# TODO: workflow commands work the same way inside a Docker action as anywhere else —
# set an output via GITHUB_OUTPUT here too, e.g.:
#   echo "greeted-at=$(date)" >> "$GITHUB_OUTPUT"
echo "TODO: greet $1"

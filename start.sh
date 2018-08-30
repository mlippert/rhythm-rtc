#!/usr/bin/env bash
docker build -t rifflearning:riff-rtc .
docker run --env-file env_template --mount type=bind,source="$(pwd)",target=/app rifflearning:riff-rtc

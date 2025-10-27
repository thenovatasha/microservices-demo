#!/usr/bin/env bash
set -euo pipefail

NUM_RUNS="${1:-1}"
NS="${2:-default}"

jobs=()
for i in $(seq 1 "$NUM_RUNS"); do
  # create one job and capture its generated name
  JOB_NAME="$(kubectl create -f tf_tasks/tf_alex_mini.yaml -n "$NS" -o jsonpath='{.metadata.name}')"
  echo "Started: $JOB_NAME"
  jobs+=($JOB_NAME)

  sleep 5
done

# echo "${jobs[@]}"
# job_time=()
# for job in "${jobs[@]}"; do
#
#   while true; do
#     PHASE="$(kuebctl get jobs.batch.volcano.sh "$JOB_NAME" -o jsonpath='{.status.state.phase}' 2>/dev/null || echo "Unkown")"
#
#     case "$PHASE" in Completed)
#       # get the start and completion time

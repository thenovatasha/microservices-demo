#!/usr/bin/env bash
set -euo pipefail

NUM_RUNS="${1:-1}"
NS="${2:-default}"

jobs=()
for i in $(seq 1 "$NUM_RUNS"); do
  # create one job and capture its generated name
  JOB_NAME="$(kubectl create -f tf.yaml -n "$NS" -o jsonpath='{.metadata.name}')"
  echo "Started: $JOB_NAME"
  jobs+=($JOB_NAME)

  # wait until the Volcano job finishes
  # Completed / Failed are the phases exposed by Volcano jobs
  # while true; do
  #   PHASE="$(kubectl get jobs.batch.volcano.sh "$JOB_NAME" -n "$NS" -o jsonpath='{.status.state.phase}' 2>/dev/null || echo "Unknown")"
  #   case "$PHASE" in
  #     Completed)
  #       echo "Done: $JOB_NAME"
  #       break
  #       ;;
  #     Failed)
  #       echo "Failed: $JOB_NAME"
  #       # stop here (remove 'exit 1' if you want to continue with the next job)
  #       exit 1
  #       ;;
  #     *)
  #       sleep 5
  #       ;;
  #   esac
  # done
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

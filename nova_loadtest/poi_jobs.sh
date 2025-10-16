#!/usr/bin/env bash
# submit_with_poisson.sh
# usage: ./submit_with_poisson.sh <mean_seconds> <count>
mean=${1:-160}
n=${2:-5}
gen=$(./poi_arrivals.sh $mean $n)      # path to the generator script

# Read generated inter-arrival times into an array
mapfile -t delays < <(echo "$gen" | tr ',' '\n')
echo "${delays[@]}"
for d in "${delays[@]}"; do
  sleep "$d"                    # sleep the inter-arrival time
  ts=$(date -Is)                # ISO-8601 timestamp
  echo "Submitting job at time: $ts (slept ${d}s)"
  # TODO: replace the echo below with kube jobs
  # kubectl create -f job.yaml
done


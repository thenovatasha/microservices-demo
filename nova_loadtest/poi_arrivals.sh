#!/usr/bin/env bash

# usage: ./poisson_arrivals.sh <mean_seconds> <count>
mean=${1:-160}
n=${2:-5}

awk -v mean="$mean" -v n="$n" 'BEGIN{
  srand()
  for(i=1;i<=n;i++){
    u = rand()                  # U ~ Uniform(0,1)
    x = -mean * log(1 - u)      # Exponential(mean)
    printf("%.0f%s", x, (i<n?", ":"\n"))
  }
}'

# Returns:
#

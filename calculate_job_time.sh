#!/bin/bash

# Script to calculate average metrics for completed vcjobs
# Usage: ./calculate_vcjob_average.sh [metric_column]
# Example: ./calculate_vcjob_average.sh 3  (to average the 3rd column)

set -e

# Default metric column (adjust based on your vcjob output)
METRIC_COLUMN=${1:-3}

echo "Fetching completed vcjobs..."

# Get all vcjobs and filter for Completed state
# Using jsonpath to extract data reliably
COMPLETED_JOBS=$(kubectl get vcjob -o json | jq -r '.items[] | select(.status.state == "Completed") | .metadata.name')

if [ -z "$COMPLETED_JOBS" ]; then
    echo "No completed vcjobs found."
    exit 0
fi

echo "Found completed vcjobs:"
echo "$COMPLETED_JOBS"
echo ""

# Initialize counters
total=0
count=0

# Process each completed job
while IFS= read -r job_name; do
    if [ -n "$job_name" ]; then
        # Get the job details in JSON format
        JOB_DATA=$(kubectl get vcjob "$job_name" -o json)

        # Extract metric - adjust the jq query based on what you want to average
        # Common metrics: duration, runtime, taskCount, etc.
        # Example: Extract duration if available in status

        # Try to extract a numeric value (customize based on your needs)
        # This example tries to get a duration or runtime value
        METRIC_VALUE=$(echo "$JOB_DATA" | jq -r '
            if .status.duration then .status.duration
            elif .status.runtime then .status.runtime
            elif .spec.tasks then (.spec.tasks | length)
            else 0
            end
        ' 2>/dev/null || echo "0")

        # If the value is a duration string (e.g., "5m30s"), convert to seconds
        if [[ "$METRIC_VALUE" =~ ^[0-9]+m[0-9]+s$ ]]; then
            minutes=$(echo "$METRIC_VALUE" | sed 's/m.*//')
            seconds=$(echo "$METRIC_VALUE" | sed 's/.*m//;s/s//')
            METRIC_VALUE=$((minutes * 60 + seconds))
        elif [[ "$METRIC_VALUE" =~ ^[0-9]+s$ ]]; then
            METRIC_VALUE=$(echo "$METRIC_VALUE" | sed 's/s//')
        elif [[ "$METRIC_VALUE" =~ ^[0-9]+m$ ]]; then
            minutes=$(echo "$METRIC_VALUE" | sed 's/m//')
            METRIC_VALUE=$((minutes * 60))
        fi

        # Ensure it's a number
        if [[ "$METRIC_VALUE" =~ ^[0-9]+\.?[0-9]*$ ]]; then
            echo "Job: $job_name - Metric: $METRIC_VALUE"
            total=$(echo "$total + $METRIC_VALUE" | bc)
            count=$((count + 1))
        else
            echo "Job: $job_name - Metric: N/A (skipping)"
        fi
    fi
done <<< "$COMPLETED_JOBS"

echo ""
echo "================================"
if [ $count -gt 0 ]; then
    average=$(echo "scale=2; $total / $count" | bc)
    echo "Total completed jobs: $count"
    echo "Sum of metrics: $total"
    echo "Average: $average"
else
    echo "No valid metrics found to calculate average."
fi


import fs from 'node:fs/promises';
import { mean, median, standardDeviation, min, max } from 'simple-statistics';
let jsonData = null;
try {
  const data = await fs.readFile('./results/pq.json', { encoding: 'utf8' });
  jsonData = JSON.parse(data);
} catch (parseError) {
  console.error('Error parsing JSON:', parseError);
}

function calcualteQueueWaitInSeconds(job) {
  const jobSubmittedAt = new Date(job.metadata.creationTimestamp);
  for (let i = 0; i < job.status.conditions.length; i++) {
    const condition = job.status.conditions[i];
    if (condition.status === "Running") {
      const startedRunningAt = new Date(condition.lastTransitionTime);
      const waitTimeInSeconds = (startedRunningAt - jobSubmittedAt) / 1000;
      return waitTimeInSeconds;
    }
  }
}

function calculateWaitTimeStatistics(volcanoJobArray) {
  let waitTimes = [];
  volcanoJobArray.items.forEach(job => {
    const waitTime = calcualteQueueWaitInSeconds(job);
    waitTimes.push(waitTime);
  });

  let meanWaitTime = mean(waitTimes);
  let medianWaitTime = median(waitTimes);
  let stdDevWaitTime = standardDeviation(waitTimes);
  let minWaitTime = min(waitTimes);
  let maxWaitTime = max(waitTimes);

  console.log("==========================");
  console.log("Wait Time Statistics (seconds):");
  console.log("Mean:", meanWaitTime);
  console.log("Median:", medianWaitTime);
  console.log("Standard Deviation:", stdDevWaitTime);
  console.log("Min:", minWaitTime);
  console.log("Max:", maxWaitTime);
  console.log("==========================");
}

function calculateTotalTimeStatistics(volcanoJobArray) {
  let totalTimes = [];
  volcanoJobArray.items.forEach(job => {
    // get creation Timestamp
    // get completed time from status.conditions
    // calculate difference in seconds
    // push to totalTimes array
    const jobSubmittedAt = new Date(job.metadata.creationTimestamp);
    for (let i = 0; i < job.status.conditions.length; i++) {
      const condition = job.status.conditions[i];
      if (condition.status === "Completed") {
        const completedAt = new Date(condition.lastTransitionTime);
        const totalTimeInSeconds = (completedAt - jobSubmittedAt) / 1000;
        totalTimes.push(totalTimeInSeconds);
      }
    }
  });

  let meanTotalTime = mean(totalTimes);
  let medianTotalTime = median(totalTimes);
  let stdDevTotalTime = standardDeviation(totalTimes);
  let minTotalTime = min(totalTimes);
  let maxTotalTime = max(totalTimes);

  console.log("==========================");
  console.log("Total Time Statistics (seconds):");
  console.log("Mean:", meanTotalTime);
  console.log("Median:", medianTotalTime);
  console.log("Standard Deviation:", stdDevTotalTime);
  console.log("Min:", minTotalTime);
  console.log("Max:", maxTotalTime);
  console.log("==========================");
}

function calculateRunTimeStatistics(volcanoJobArray) {
  let runTimes = [];
  volcanoJobArray.items.forEach(job => {
    // get first running time from status.conditions
    // get completed time from status.conditions
    // calculate difference in seconds
    // push to runTimes array
    const firstRunningAt = (() => {
      for (let i = 0; i < job.status.conditions.length; i++) {
        const condition = job.status.conditions[i];
        if (condition.status === "Running") {
          return new Date(condition.lastTransitionTime);
        }
      }
    });

    const completedAt = (() => {
      for (let i = 0; i < job.status.conditions.length; i++) {
        const condition = job.status.conditions[i];
        if (condition.status === "Completed") {
          return new Date(condition.lastTransitionTime);
        }
      }
    });

    const runTimeInSeconds = (completedAt() - firstRunningAt()) / 1000;
    runTimes.push(runTimeInSeconds);
  });
  let meanRunTime = mean(runTimes);
  let medianRunTime = median(runTimes);
  let stdDevRunTime = standardDeviation(runTimes);
  let minRunTime = min(runTimes);
  let maxRunTime = max(runTimes);

  console.log("==========================");
  console.log("Run Time Statistics (seconds):");
  console.log("Mean:", meanRunTime);
  console.log("Median:", medianRunTime);
  console.log("Standard Deviation:", stdDevRunTime);
  console.log("Min:", minRunTime);
  console.log("Max:", maxRunTime);
  console.log("==========================");
}

function getRunTimeInSeconds(job) {
  if (job.status.state.phase == 'Completed') {
    const str = job.status.runningDuration;
    const match = String(str).trim().match(/^(\d+)m(\d+)s$/i);
    if (!match) throw new Error('Expected "<number>m<number>s"');
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    return minutes * 60 + seconds; // accepts any seconds value
  } else {
    console.error("Job not completed yet");
    return -1;
  }
}

function calculateThroughput(volcanoJobArray) {
  // Get a list of all creation times
  // Get a list of all completion times
  // Calculate the difference from the earliest creation time to the latest completion time
  let creationTimes = [];
  let completionTimes = [];
  volcanoJobArray.items.forEach(job => {
    const creationTime = new Date(job.metadata.creationTimestamp).getTime();
    creationTimes.push(creationTime);
    if (job.status.state.phase == 'Completed') {
      for (let i = 0; i < job.status.conditions.length; i++) {
        const condition = job.status.conditions[i];
        if (condition.status === "Completed") {
          const completedAt = new Date(condition.lastTransitionTime).getTime();
          completionTimes.push(completedAt);
        }
      }
    }
  });
  const earliestCreationTime = Math.min(...creationTimes);
  const latestCompletionTime = Math.max(...completionTimes);
  const totalDurationInSeconds = (latestCompletionTime - earliestCreationTime) / 1000;
  const totalJobs = volcanoJobArray.items.length;
  const throughput = totalJobs / totalDurationInSeconds; // jobs per second

  console.log("==========================");
  console.log("Throughput:");
  console.log("Total Jobs:", totalJobs);
  console.log("Total Duration (seconds):", totalDurationInSeconds);
  console.log("Throughput (jobs/second):", throughput);
  console.log("==========================");
}

calculateThroughput(jsonData);      // jobs per second
calculateRunTimeStatistics(jsonData); // from first running to completed
calculateWaitTimeStatistics(jsonData); // from submitted to first running
calculateTotalTimeStatistics(jsonData); // from submitted to completed

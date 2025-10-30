import fs from 'node:fs/promises';
import { mean, median, standardDeviation, min, max } from 'simple-statistics';
let jsonData = null;
try {
  const data = await fs.readFile('./nova_loadtest/60_60_baseline.json', { encoding: 'utf8' });
  jsonData = JSON.parse(data);
} catch (parseError) {
  console.error('Error parsing JSON:', parseError);
}

function calcualteAverage(volcanoJobArray) {
  // ensure all jobs have
  console.log(volcanoJobArray.items[0]);
  console.log("=========================");
  volcanoJobArray.items[0].status.conditions.forEach(condition => {
    console.log(condition.lastTransitionTime, condition.status);
  })
  console.log(volcanoJobArray.items[0].status.conditions[0]);
}

function calcualteQueueWaitInSeconds(job) {
  const jobSubmittedAt = new Date(job.metadata.creationTimestamp);
  console.log("Job submitted at:", jobSubmittedAt);

  for (let i = 0; i < job.status.conditions.length; i++) {
    const condition = job.status.conditions[i];
    console.log(condition.lastTransitionTime, condition.status);
    if (condition.status === "Running") {
      const startedRunningAt = new Date(condition.lastTransitionTime);
      console.log("Job started running at:", startedRunningAt);
      const waitTimeInSeconds = (startedRunningAt - jobSubmittedAt) / 1000;
      console.log("Queue wait time in seconds:", waitTimeInSeconds);
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

  console.log("Wait Time Statistics (seconds):");
  console.log("Mean:", meanWaitTime);
  console.log("Median:", medianWaitTime);
  console.log("Standard Deviation:", stdDevWaitTime);
  console.log("Min:", minWaitTime);
  console.log("Max:", maxWaitTime);

}

function getRunTimeInSeconds(job) {
  if (job.status.state.phase == 'Completed') {
    const str = job.status.runningDuration;
    console.log(str);
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

}
// calcualteAverage(jsonData);
console.log(calculateWaitTimeStatistics(jsonData));
// console.log(getRunTimeInSeconds(jsonData.items[0]));

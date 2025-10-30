import fs from 'node:fs/promises';

try {
  const data = await fs.readFile('./nova_loadtest/60_60_baseline.json', {encoding: 'utf8'});
  const jsonData = JSON.parse(data);
  console.log(jsonData.items[0]);
} catch (parseError){
  console.error('Error parsing JSON:', parseError);
}


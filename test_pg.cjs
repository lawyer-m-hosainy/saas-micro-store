const { Client } = require('pg');
const regions = ['eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'me-south-1', 'us-east-1', 'us-east-2', 'us-west-1', 'ap-south-1', 'me-central-1', 'ap-southeast-1'];
const pw = '18620142032015Ess';
const ref = 'dgnxqzdmzbkrygukwcwe';

(async () => {
  for (let r of regions) {
    const url = 'postgresql://postgres.'+ref+':'+pw+'@aws-0-'+r+'.pooler.supabase.com:6543/postgres';
    const c = new Client({ connectionString: url, connectionTimeoutMillis: 4000 });
    try {
      await c.connect();
      console.log('SUCCESS:' + url);
      await c.end();
      return;
    } catch(e) {
      console.log('FAILED:' + r, e.message);
    }
  }
  console.log('ALL FAILED');
  process.exit(1);
})();

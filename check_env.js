const fs = require('fs');
try {
  const c = fs.readFileSync('C:/Users/MSI/Desktop/wedding-rsvp/.env.local', 'utf8');
  console.log(c);
} catch(e) {
  console.log('NOT FOUND: ' + e.message);
}

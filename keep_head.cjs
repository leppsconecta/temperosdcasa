const fs = require('fs');
const files = [
  'pages/AboutPage.tsx',
  'pages/Home.tsx',
  'pages/ProductsPage.tsx',
  'pages/TrabalheConosco.tsx'
];

files.forEach(p => {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    // keep HEAD (the part between <<<<<<< HEAD and =======)
    // remove ======= to >>>>>>> 47ad34f4e89d90b2c4542364948ec5a39214d924
    
    // First, verify if there are conflicts
    if (c.includes('<<<<<<< HEAD')) {
      // Split by <<<<<<< HEAD
      const parts = c.split(/<<<<<<< HEAD\r?\n/);
      let newC = parts[0];
      
      for (let i = 1; i < parts.length; i++) {
        const [headPart, restAfterHead] = parts[i].split(/=======\r?\n/);
        const [remotePart, ...restAfterRemote] = restAfterHead.split(/>>>>>>> 47ad34f4e89d90b2c4542364948ec5a39214d924\r?\n?/);
        // We keep headPart
        newC += headPart + restAfterRemote.join('>>>>>>> 47ad34f4e89d90b2c4542364948ec5a39214d924\n');
      }
      fs.writeFileSync(p, newC);
      console.log('Fixed', p);
    }
  }
});

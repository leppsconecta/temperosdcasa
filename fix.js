const fs = require('fs');
const p = 'pages/PublicFormFuncionario.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/<<<<<<< HEAD[\s\S]*?=======\r?\n/g, '');
c = c.replace(/>>>>>>> 47ad34f4e89d90b2c4542364948ec5a39214d924\r?\n?/g, '');
fs.writeFileSync(p, c);

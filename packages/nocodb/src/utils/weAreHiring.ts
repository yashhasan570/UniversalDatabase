import boxen from 'boxen';

export default function () {
  console.log(`
 ${boxen(`Join the forces http://careers.universaldatabase.com`, {
   title: '🚀 We are Hiring!!! 🚀',
   padding: 1,
   margin: 1,
   titleAlignment: 'center',
   borderColor: 'green',
 })}
`);
}

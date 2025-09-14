document.addEventListener('DOMContentLoaded',()=>{
 const btn=document.querySelector('#mehr-erfahren');
 if(btn){btn.addEventListener('click',e=>{
  const t=document.querySelector(btn.getAttribute('href'));
  if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
 });}
 const banner=document.querySelector('.cookie-banner'); 
 if(banner){banner.querySelector('button').addEventListener('click',()=>banner.remove());}
});
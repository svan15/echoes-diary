export const starter = [
 {id:'one',name:'Our Little Universe',kind:'Couple',description:'A space for our memories, little moments, and everything in between.',accent:'#dca9a6',cover:'',background:'',members:['You','Alex'],entries:[{id:'a',author:'You',title:'A calm evening',body:'Some days are worth remembering simply because we spent them together.',type:'shared',date:'2026-10-12'},{id:'b',author:'You',title:'A little thought',body:'I want to remember how this chapter of life feels.',type:'personal',visibility:'private',date:'2026-10-11'}]},
 {id:'two',name:'The Chaos Chronicles',kind:'Best Friends',description:'All our unforgettable adventures.',accent:'#9fc9b5',cover:'',background:'',members:['You','Sam'],entries:[{id:'c',author:'You',title:'That unforgettable weekend',body:'We laughed until we could barely breathe.',type:'shared',date:'2026-10-09'}]},
 {id:'three',name:'Letters to Myself',kind:'Personal',description:'A quiet place just for me.',accent:'#b4a4da',cover:'',background:'',members:['You'],entries:[]}
];
export function newId(){return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}

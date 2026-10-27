export const tracks=['African Rhythms','Kazi','Funky Wood','Tarishi','Mashariki','Chants','Don’t Give Up','Incognito','Poo Too','Liberation Dues','African Rhythms (45 Version Parts 1 & 2)','Afrobeat'];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function ease(v){v=clamp(v);return v*v*(3-2*v)}
export function motion(progress){
 const p=clamp(progress),press=ease(p/.12)*(1-ease((p-.21)/.1)),fan=ease((p-.32)/.3),settle=ease((p-.64)/.18),pull=ease((p-.78)/.2);
 return {p,press,fan,settle,pull,keyOpacity:1-ease((p-.24)/.13),logoOpacity:ease((p-.1)/.08)*(1-ease((p-.29)/.13)),aura:p>=.51?0:Math.sin(clamp((p-.04)/.47)*Math.PI)*.48,glass:ease((p-.91)/.09),phase:p<.12?'origin':p<.32?'reveal':p<.65?'archive':p<.9?'handoff':'discover'};
}
export const trackIndex=v=>Math.round(clamp(Number(v),0,tracks.length-1));

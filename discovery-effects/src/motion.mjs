export const tracks=['African Rhythms','Kazi','Funky Wood','Tarishi','Mashariki','Chants','Don’t Give Up','Incognito','Poo Too','Liberation Dues','African Rhythms (45 Version Parts 1 & 2)','Afrobeat'];
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function ease(v){v=clamp(v);return v*v*(3-2*v)}
export function motion(progress){
 const p=clamp(progress),press=ease(p/.1)*(1-ease((p-.12)/.08)),fan=ease((p-.35)/.15),settle=ease((p-.55)/.06),pull=ease((p-.59)/.09),roll=ease((p-.68)/.14),land=ease((p-.82)/.12);
 return {p,press,fan,settle,pull,roll,land,keyOpacity:1-ease((p-.12)/.06),saxOpacity:ease((p-.14)/.07)*(1-ease((p-.32)/.06)),logoOpacity:ease((p-.14)/.05)*(1-ease((p-.3)/.06)),aura:0,glass:ease((p-.94)/.06),phase:p<.15?'origin':p<.35?'reveal':p<.57?'archive':p<.94?'handoff':'discover'};
}
export const trackIndex=v=>Math.round(clamp(Number(v),0,tracks.length-1));

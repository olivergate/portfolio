/**
 * Inline bootstrap script — runs synchronously in <head> before React hydrates.
 * Reads localStorage, computes the same tokens stateToTokens would produce,
 * and writes them onto <html>'s style. Without this, returning to "/" with a
 * non-default cached look causes a brief flash of the default theme before
 * hydration takes over.
 *
 * Scoped to "/" only. The slider deck and persisted styling exist for the
 * main CV page; on /jd, /tone, /lab, /game the script bails so the server
 * and client render with identical default tokens (no hydration mismatch
 * and no leaked styling from the cached `/` look).
 *
 * Storage key + value shape must match `lib/local-storage-state.ts`. Tested
 * by `tests/bootstrap-parity.test.ts`.
 *
 * Kept tiny by inlining a stripped-down stateToTokens. The full implementation
 * still lives in lib/style-tokens.ts and runs on every subsequent slider move.
 *
 * The script is emitted as a string and dropped into <Script strategy="beforeInteractive">.
 */

const STATE_TO_TOKENS_SOURCE = `
  function lerp(a,b,t){return a+(b-a)*t;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function mix(a,b,t){
    var ah=a.replace("#",""),bh=b.replace("#","");
    var ar=parseInt(ah.slice(0,2),16),ag=parseInt(ah.slice(2,4),16),ab=parseInt(ah.slice(4,6),16);
    var br=parseInt(bh.slice(0,2),16),bg=parseInt(bh.slice(2,4),16),bb=parseInt(bh.slice(4,6),16);
    var r=Math.round(lerp(ar,br,t)),g=Math.round(lerp(ag,bg,t)),bl=Math.round(lerp(ab,bb,t));
    return "#"+r.toString(16).padStart(2,"0")+g.toString(16).padStart(2,"0")+bl.toString(16).padStart(2,"0");
  }
  function bulletCap(d){if(d<0.18)return 2;if(d<0.38)return 3;if(d<0.6)return 5;if(d<0.78)return 6;return 99;}
  function tok(s){
    var d=s.density,p=s.polish,h=s.hierarchy,m=s.motion;
    var bru=p<0.28,ref=p>0.72;
    var t={};
    t["--bg"]=mix("#ffffff","#faf7f2",p);
    t["--fg"]=mix("#000000","#1c1915",p);
    t["--muted"]=mix("#3a3a3a","#6b645b",p);
    t["--rule"]=mix("#000000","#c4b9a8",p);
    t["--rule-weight"]=bru?"2px":"1px";
    t["--card-bg"]=bru?"#ffffff":mix("#ffffff","#fffdf7",p);
    t["--card-border"]=bru?"rgba(0,0,0,1)":"rgba(28,25,21,"+(0.18-0.10*p).toFixed(3)+")";
    t["--card-border-width"]=bru?"2px":"1px";
    t["--accent"]=mix("#000000","#a04a26",p);
    t["--inverse-bg"]=bru?"#000000":"#1c1915";
    t["--inverse-fg"]=bru?"#ffffff":"#f4f0e8";
    t["--radius"]=bru?"0px":Math.round(lerp(0,8,p))+"px";
    t["--radius-chip"]=bru?"0px":(p>0.65?"999px":"3px");
    t["--shadow"]=bru?"none":(ref?"0 1px 2px rgba(28,25,21,0.04)":"0 1px 2px rgba(0,0,0,0.03)");
    t["--font-display"]=bru?"var(--font-grotesk), 'Inter', sans-serif":(p<0.55?"var(--font-body-next), 'Inter', sans-serif":"var(--font-display-next), 'Fraunces', Georgia, serif");
    t["--font-body"]="var(--font-body-next), 'Inter', system-ui, sans-serif";
    t["--case-display"]=bru?"uppercase":"none";
    t["--case-h2"]=bru?"uppercase":"none";
    t["--case-h3"]=p<0.18?"uppercase":"none";
    t["--lede-style"]=p>0.7?"italic":"normal";
    t["--lede-weight"]=p>0.7?"400":"var(--weight-body)";
    t["--blurb-style"]=p>0.78?"italic":"normal";
    t["--tagline-style"]=p>0.8?"italic":"normal";
    t["--avocation-style"]=p>0.8?"italic":"normal";
    t["--bullet-marker-w"]=bru?"0.45rem":(p>0.7?"5px":"0.55rem");
    t["--bullet-marker-h"]=bru?"0.45rem":(p>0.7?"5px":"1px");
    t["--bullet-marker-radius"]=p>0.7?"999px":"0";
    t["--bullet-marker-color"]=p>0.7?"var(--accent)":"var(--fg)";
    t["--skill-font"]=p>0.55?"var(--font-body-next), 'Inter', sans-serif":"var(--font-mono-next), 'JetBrains Mono', ui-monospace, monospace";
    t["--skill-border"]=bru?"1px solid var(--fg)":"none";
    t["--skill-pad"]=bru?"0.4rem 0.6rem":"0";
    t["--skill-case"]=bru?"uppercase":"none";
    t["--skill-tracking"]=bru?"0.12em":"0.01em";
    t["--skill-sep-display"]=p>0.55?"inline":"none";
    t["--skill-gap"]=bru?"0.4rem 0.4rem":(p>0.55?"0.1rem 0.1rem":"0.4rem 0.5rem");
    t["--skill-size"]=bru?"var(--size-meta)":"var(--size-body)";
    t["--chip-bg"]="transparent";
    var h1Min=lerp(1.6,2.6,h),h1Pref=lerp(2.2,9,h),h1Max=lerp(2.6,7.5,h);
    t["--size-h1"]="clamp("+h1Min.toFixed(2)+"rem, "+h1Pref.toFixed(2)+"vw, "+h1Max.toFixed(2)+"rem)";
    t["--size-h2"]=lerp(1.2,2.6,h).toFixed(2)+"rem";
    t["--size-h3"]=lerp(1.0,1.35,h).toFixed(2)+"rem";
    t["--size-body"]="1rem";
    t["--size-meta"]=lerp(0.82,0.74,h).toFixed(2)+"rem";
    t["--size-tagline"]=lerp(1.05,1.45,h).toFixed(2)+"rem";
    var trkD=bru?lerp(0.02,0.0,p/0.28).toFixed(3)+"em":lerp(-0.01,-0.025,(p-0.28)/0.72).toFixed(3)+"em";
    t["--tracking-display"]=trkD;
    t["--tracking-h1"]=bru?trkD:lerp(-0.005,-0.04,h).toFixed(3)+"em";
    t["--tracking-h2"]=lerp(-0.002,-0.02,h).toFixed(3)+"em";
    var wD=bru?Math.round(lerp(700,800,h)):Math.round(lerp(500,700,h));
    t["--weight-display"]=String(wD);
    t["--weight-h2"]=String(wD);
    t["--weight-h3"]=String(Math.round(lerp(500,600,h)));
    t["--weight-body"]="400";
    t["--gap-section"]=lerp(7.5,2.2,d).toFixed(2)+"rem";
    t["--gap-block"]=lerp(2.8,1.0,d).toFixed(2)+"rem";
    t["--gap-item"]=lerp(1.1,0.5,d).toFixed(2)+"rem";
    t["--pad-card"]=lerp(2.4,1.0,d).toFixed(2)+"rem";
    t["--line"]=lerp(1.7,1.35,d).toFixed(2);
    t["--col-count"]=d>0.55?"2":"1";
    t["--proj-cols"]=d>0.45?"2":"1";
    t["--bullet-cap"]=String(bulletCap(d));
    t["--motion-fast"]=Math.round(lerp(0,200,m))+"ms";
    t["--motion-base"]=Math.round(lerp(0,360,m))+"ms";
    t["--motion-slow"]=Math.round(lerp(0,580,m))+"ms";
    t["--motion-display"]=Math.round(lerp(0,700,m))+"ms";
    t["--stagger"]=Math.round(lerp(0,75,m))+"ms";
    t["--density"]=String(d);t["--polish"]=String(p);t["--hierarchy"]=String(h);t["--motion"]=String(m);
    return t;
  }
  function readStored(){
    try{
      var raw=window.localStorage.getItem("olg-cv-style-v1");
      if(raw==null)return null;
      var p=JSON.parse(raw);
      if(!p||typeof p!=="object")return null;
      var keys=["density","polish","hierarchy","motion"],o={};
      for(var i=0;i<4;i++){
        var v=p[keys[i]];
        if(typeof v!=="number"||!isFinite(v))return null;
        o[keys[i]]=clamp(v,0,1);
      }
      return o;
    }catch(e){return null;}
  }
  if(location.pathname!=="/")return;
  var defaults={density:0.5,polish:0.55,hierarchy:0.55,motion:0.5};
  var s=readStored()||defaults;
  var t=tok(s),r=document.documentElement.style;
  for(var k in t)r.setProperty(k,t[k]);
`;

export const BOOTSTRAP_SCRIPT = `(function(){try{(function(){${STATE_TO_TOKENS_SOURCE}})();}catch(e){}})();`;

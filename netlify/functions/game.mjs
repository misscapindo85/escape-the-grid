import { getStore } from "@netlify/blobs";

const store = getStore("escape-grid-sessions");
const PIN = "7410";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeCode(){let s="";for(let i=0;i<6;i++)s+=alphabet[Math.floor(Math.random()*alphabet.length)];return s}
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
async function load(code){if(!code)throw Error("Enter a game code.");const s=await store.get(code,{type:"json"});if(!s)throw Error("That game code was not found. Check the code with your teacher.");return s}
async function save(s){await store.setJSON(s.code,s);return s}
export default async (req)=>{
 try{
  const url=new URL(req.url);
  if(req.method==="GET"){
   const code=(url.searchParams.get("code")||"").toUpperCase(),teamId=url.searchParams.get("teamId");
   const s=await load(code);
   return json(teamId?{session:{code:s.code,pausedAt:s.pausedAt,pausedTotal:s.pausedTotal,teams:Object.fromEntries(Object.entries(s.teams).map(([id,t])=>[id,{id,state:t.state}]))},state:s.teams[teamId]?.state||null}:{code:s.code,pausedAt:s.pausedAt,pausedTotal:s.pausedTotal,teams:Object.fromEntries(Object.entries(s.teams).map(([id,t])=>[id,{id,state:t.state}]))});
  }
  if(req.method!=="POST")return json({error:"Method not allowed."},405);
  const b=await req.json();
  if(b.action==="create"){
   if(b.pin!==PIN)return json({error:"Incorrect teacher code."},403);
   let code;do{code=makeCode()}while(await store.get(code));
   const s={code,createdAt:Date.now(),pausedAt:0,pausedTotal:0,teams:{}};
   await save(s);return json({code:s.code,pausedAt:0,pausedTotal:0,teams:{}});
  }
  const code=(b.code||"").toUpperCase(),s=await load(code);
  if(b.action==="join"){
   if(!b.team||!b.members)return json({error:"Enter your team name and all team members."},400);
   const teamId=crypto.randomUUID();
   const state={team:b.team,members:b.members,period:b.period||"P5",phase:"room",start:Date.now(),idx:0,tries:0,results:[],last:null,wrongMsg:"",used:0,timedOut:false,endedEarly:false};
   s.teams[teamId]={id:teamId,state};await save(s);
   return json({session:{code:s.code,pausedAt:s.pausedAt,pausedTotal:s.pausedTotal},teamId,state});
  }
  if(b.action==="pause"||b.action==="resume"){
   if(b.pin!==PIN)return json({error:"Teacher authorization failed."},403);
   if(b.action==="pause"&&!s.pausedAt)s.pausedAt=Date.now();
   if(b.action==="resume"&&s.pausedAt){s.pausedTotal=(s.pausedTotal||0)+Date.now()-s.pausedAt;s.pausedAt=0}
   await save(s);return json({code:s.code,pausedAt:s.pausedAt,pausedTotal:s.pausedTotal,teams:Object.fromEntries(Object.entries(s.teams).map(([id,t])=>[id,{id,state:t.state}]))});
  }
  if(b.action==="update"){
   if(!s.teams[b.teamId])return json({error:"This team is no longer in the game."},404);
   s.teams[b.teamId].state=b.state;await save(s);return json({ok:true});
  }
  return json({error:"Unknown action."},400);
 }catch(e){return json({error:e.message||"Unexpected server error."},400)}
};
import { offerQuest } from './quest-system.js';

export function receiveRadioMessage(state, message) {
  state.world.radioLog ??= [];
  state.world.radioLog.push({ id:message.id, text:message.text, source:message.source??'Unknown', day:state.world.day, minute:state.world.minutes });
  return state;
}

function mark(state,id){ state.world.triggeredEvents ??= {}; state.world.triggeredEvents[id]=true; }
function seen(state,id){ return Boolean(state.world.triggeredEvents?.[id]); }

export function triggerScheduledEvents(state) {
  if(state.world.day>=2 && !seen(state,'radio-distress-north')) {
    receiveRadioMessage(state,{id:'radio-distress-north',source:'Open Frequency',text:'Distress signal from the northern blocks. Survivors request assistance.'});
    offerQuest(state,{id:'distress-north-001',title:'Northern Distress Signal',source:'radio',status:'offered',objectives:[{id:'reach-signal',label:'Reach the reported signal area',completed:false}],reward:{craReputation:5,researchNote:true}});
    mark(state,'radio-distress-north');
  }
  if(state.world.day>=3 && !seen(state,'railway-horde-warning')) {
    state.world.threats ??= {}; state.world.threats['railway-district']='orange';
    state.world.blockedRoutes ??= []; const route='railway-district:freight-logistics-park'; if(!state.world.blockedRoutes.includes(route)) state.world.blockedRoutes.push(route);
    receiveRadioMessage(state,{id:'railway-horde-warning',source:'Emergency Broadcast',text:'Horde warning: infected migration entering Railway District. Freight route is blocked.'});
    mark(state,'railway-horde-warning');
  }
  if(state.world.day>=4 && !seen(state,'cra-trade-request')) {
    receiveRadioMessage(state,{id:'cra-trade-request',source:'CRA',text:'CRA Railway Relief Checkpoint requests water and medical supplies.'});
    offerQuest(state,{id:'cra-supply-request',title:'Checkpoint Supply Request',source:'cra',status:'offered',objectives:[{id:'deliver-supplies',label:'Deliver requested supplies',completed:false}],reward:{craReputation:3}});
    mark(state,'cra-trade-request');
  }
  return state;
}

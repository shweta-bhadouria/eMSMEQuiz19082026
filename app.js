const POINTS_PER_QUESTION = 10;
const APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbyG5ZRdztLTvRJIC-oYTH6GPMVkSfoOGxqbTI4x8ceF6SHk8LsNmPzevWEBRFKolaNx/exec";const SHEET_URL="Results";const ADMIN_PIN="ADMIN2026";const Q=window.QUIZ_QUESTIONS;const S = {
  session: null,
  participant: null,
  adminResults: [],
  selected: null,
  revealed: false,
  error: "",
  status: null
};
const $=id=>document.getElementById(id);function configured(){return !APPS_SCRIPT_URL.includes("PASTE_")}function toast(msg,type="ok"){S.status={msg,type};render();setTimeout(()=>{S.status=null;render()},2500)}function jsonp(action,p={}){return new Promise((resolve,reject)=>{if(!configured())return reject(new Error("Apps Script URL is not configured"));const cb="cb_"+Date.now()+Math.random().toString(16).slice(2);const s=document.createElement("script");window[cb]=d=>{delete window[cb];s.remove();d&&d.ok!==false?resolve(d):reject(new Error(d&&d.error?d.error:"Apps Script error"))};s.onerror=()=>{delete window[cb];s.remove();reject(new Error("Could not reach Apps Script"))};s.src=APPS_SCRIPT_URL+"?"+new URLSearchParams({action,callback:cb,...p});document.body.appendChild(s)})}async function post(payload){if(!configured())return toast("Apps Script URL is not configured","err");try{await fetch(APPS_SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(payload)});toast("Progress saved")}catch(e){toast("Could not save progress","err")}}function newP(id,name){return{id,name,index:0,score:0,answers:{},complete:false,startedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}async function participantLogin(){const name=$("name").value.trim(),id=$("pid").value.trim().toUpperCase();if(!name||!id){S.error="Enter your name and participant ID.";return render()}S.error="";try{const d=await jsonp("getParticipant",{participantId:id,pin:ADMIN_PIN});S.participant=d.state?JSON.parse(d.state):newP(id,name)}catch(e){S.participant=newP(id,name);toast("Starting a new attempt; saved progress could not be loaded.","err")}S.participant.name=name;S.session="participant";render()}async function adminLogin(){if($("pin").value!==ADMIN_PIN){S.error="Invalid admin PIN.";return render()}S.error="";S.session="admin";await refreshAdmin()}async function refreshAdmin(){try{const d=await jsonp("results",{pin:ADMIN_PIN});S.adminResults=d.results||[];toast("Results refreshed")}catch(e){toast(e.message,"err")}render()}function logout(){S.session=null;S.participant=null;S.selected=null;render()}function choose(index) {
S.selected = index;
render();
}

async function submit() {
if (S.selected === null) {
return;
}
 
const participant = S.participant;
const question = Q[participant.index];
const isCorrect = S.selected === question.correct;
 
participant.answers[question.id] = {
selected: S.selected,
correct: isCorrect,
points: isCorrect ? POINTS_PER_QUESTION : 0
};
 
participant.score = Object.values(participant.answers).reduce(
(total, answer) => total + Number(answer.points || 0),
0
);
 
participant.updatedAt = new Date().toISOString();
 
if (participant.index >= Q.length - 1) {
participant.complete = true;
} else {
participant.index += 1;
}
 
S.selected = participant.complete
? null
: participant.answers[Q[participant.index].id]?.selected ?? null;
 
await saveParticipant();
render();
}

async function previousQuestion() {
const participant = S.participant;
 
if (participant.index === 0) {
return;
}
 
participant.index -= 1;
 
const previousAnswer = participant.answers[Q[participant.index].id];
S.selected = previousAnswer
? previousAnswer.selected
: null;
 
render();
}

async function next(){const p=S.participant;if(p.index>=Q.length-1)p.complete=true;else p.index++;S.selected=null;p.updatedAt=new Date().toISOString();await saveParticipant();render()}async function saveParticipant(){const p=S.participant;await post({action:"save",pin:ADMIN_PIN,participantId:p.id,name:p.name,state:JSON.stringify(p)})}function exportCsv(){const rows=[["Participant ID","Name","Score","Answered","Correct","Status","Updated At"],...S.adminResults.map(r=>[r.participantId,r.name,r.score,r.answered,r.correct,r.status,r.updatedAt])];const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="emsme-quiz-results.csv";a.click()}function status(){return S.status?`<div class="status ${S.status.type==='err'?'err':''}">${S.status.msg}</div>`:""}function login(){app.innerHTML=`<div class="login"><div class="wrap"><div class="center"><span class="badge">eMSME Quiz</span><h1 style="font-size:48px">eMSME Knowledge Challenge</h1><p>Answer 30 multiple-choice questions and test your knowledge.</p></div><div class="grid g2" style="margin-top:34px"><div class="card pad"><h2>Participant Login</h2><input id="name" class="input" placeholder="Full name"><input id="pid" class="input" placeholder="Participant ID / employee code"><button class="btn" style="width:100%;margin-top:13px" onclick="participantLogin()">Start Quiz</button></div><div class="card pad"><h2>Admin Login</h2><input id="pin" type="password" class="input" placeholder="Admin PIN"><button class="btn green" style="width:100%;margin-top:13px" onclick="adminLogin()">Open Results</button></div></div>${S.error?`<p class="center" style="color:#fecdd3">${S.error}</p>`:""}<p class="center small" style="color:#cbd5e1;margin-top:28px">This quiz is intended for individual learning and engagement.</p></div></div>${status()}`}function participant() {
  const participant = S.participant;

  if (participant.complete) {
    return complete();
  }

  const question = Q[participant.index];
  const savedAnswer = participant.answers[question.id];

  if (
    S.selected === null &&
    savedAnswer &&
    savedAnswer.selected !== undefined
  ) {
    S.selected = savedAnswer.selected;
  }

  document.getElementById("app").innerHTML = `
    <div class="hero">
      <div class="wrap row">
        <div>
          <span class="badge">${participant.name}</span>
          <h1>eMSME Knowledge Challenge</h1>
        </div>

        <div>
          <div class="small">Answered</div>
          <div class="score">
            ${Object.keys(participant.answers).length}/${Q.length}
          </div>
        </div>
      </div>
    </div>

    <main class="wrap">
      <div class="row">
        <span>Question ${participant.index + 1} of ${Q.length}</span>
        <span>${question.category}</span>
      </div>

      <div class="bar" style="margin:10px 0 20px">
        <div
          class="fill"
          style="width:${((participant.index + 1) / Q.length) * 100}%"
        ></div>
      </div>

      <div class="card pad">
        <h2>${question.question}</h2>

        <div class="grid g2">
          ${question.options.map((option, index) => `
            <div
              class="option ${S.selected === index ? "selected" : ""}"
              onclick="choose(${index})"
            >
              <b>${String.fromCharCode(65 + index)}.</b>
              ${option}
            </div>
          `).join("")}
        </div>

        <div class="row" style="margin-top:18px">
          <button
            class="btn light"
            ${participant.index === 0 ? "disabled" : ""}
            onclick="previousQuestion()"
          >
            Previous
          </button>

          <button
            class="btn"
            ${S.selected === null ? "disabled" : ""}
            onclick="submit()"
          >
            ${
              participant.index === Q.length - 1
                ? "Submit Quiz"
                : "Save & Next"
            }
          </button>
        </div>
      </div>
    </main>

    ${status()}
  `;
}
function complete() {
  const participant = S.participant;
  const correctCount = Object.values(participant.answers)
    .filter(answer => answer.correct)
    .length;

  document.getElementById("app").innerHTML = `
    <div class="hero">
      <div class="wrap center">
        <span class="badge">Quiz Complete</span>

        <h1>eMSME Knowledge Challenge</h1>

        <p style="font-size:22px">
          ${participant.name}, you scored
          <b>${participant.score}</b>
          out of
          <b>${Q.length * POINTS_PER_QUESTION}</b>.
        </p>

        <p>
          Correct answers:
          <b>${correctCount}</b>
          of
          <b>${Q.length}</b>
        </p>
      </div>
    </div>

    <main class="wrap">
      <h2>Answer Review</h2>

      ${Q.map(question => {
        const answer = participant.answers[question.id];
        const isCorrect = answer && answer.correct;
        const selectedText = answer
          ? question.options[answer.selected]
          : "Not answered";

        return `
          <div
            class="card pad"
            style="
              margin-bottom:14px;
              border:2px solid ${isCorrect ? "#a7f3d0" : "#fecdd3"};
            "
          >
            <div class="row">
              <div>
                <span class="badge">
                  Question ${question.id}
                </span>

                <span class="small muted">
                  ${question.category}
                </span>
              </div>

              <b style="color:${isCorrect ? "#047857" : "#be123c"}">
                ${isCorrect ? "Correct" : "Incorrect"}
              </b>
            </div>

            <h3>${question.question}</h3>

            <div
              class="feedback ${isCorrect ? "ok" : "no"}"
            >
              <b>Your answer:</b>
              ${selectedText}
            </div>

            ${
              !isCorrect
                ? `
                  <div class="feedback ok">
                    <b>Correct answer:</b>
                    ${question.options[question.correct]}
                  </div>
                `
                : ""
            }

            <p class="small muted">
              Points earned:
              ${answer ? answer.points : 0}
              / ${POINTS_PER_QUESTION}
            </p>
          </div>
        `;
      }).join("")}

      <div class="center" style="padding:20px">
        <button class="btn light" onclick="logout()">
          Return to Login
        </button>
      </div>
    </main>

    ${status()}
  `;
}
function admin(){const sorted=[...S.adminResults].sort((a,b)=>b.score-a.score);app.innerHTML=`<div class="hero"><div class="wrap row"><div><span class="badge">Admin Results</span><h1>eMSME Quiz Participants</h1></div><button class="btn light" onclick="logout()">Logout</button></div></div><main class="wrap"><div class="row" style="justify-content:flex-end"><button class="btn light" onclick="refreshAdmin()">Refresh Results</button><button class="btn" onclick="exportCsv()">Export CSV</button>${SHEET_URL.includes('PASTE_')?'':`<a class="btn green" target="_blank" href="${SHEET_URL}">Open Result Sheet</a>`}</div><div class="grid g3" style="margin-top:18px">${sorted.length?sorted.map((r,i)=>`<div class="card pad admin-card"><div class="row"><div><span class="badge">Rank #${i+1}</span><h3>${r.name}</h3><p class="small muted">${r.participantId}</p></div><div class="score">${r.score}</div></div><div class="bar"><div class="fill" style="width:${Answered ${r.answered}/${Q.length} · Correct ${r.correct}}%"></div></div><p>Answered ${r.answered}/30 · Correct ${r.correct}</p><p class="small muted">${r.status} · ${r.updatedAt||''}</p></div>`).join(""):`<div class="card pad">No participants have started yet.</div>`}</div></main>${status()}`}function render(){if(!S.session)return login();if(S.session==='admin')return admin();return participant()}render();

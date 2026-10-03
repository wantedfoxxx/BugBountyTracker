/* =========================================================
   BUG HUNTING OS
   Bug Bounty + Content + Personal Routine
   LocalStorage based
========================================================= */

const STORAGE_KEY = "bug_hunting_os_v3";


/* =========================================================
   DATABASE
========================================================= */

let db = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {

  targets: [],

  findings: [],

  reports: [],

  sessions: [],

  content: [],

  routine: [],

  routineChecks: {},

  journals: {},

  quickNotes: []

};


function saveDB() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(db)
  );

  refresh();
}


function uid() {

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);

}


function today() {

  const d = new Date();

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const day =
    String(d.getDate()).padStart(2, "0");

  return `${d.getFullYear()}-${month}-${day}`;

}


function escapeHTML(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   DATE
========================================================= */

document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );


/* =========================================================
   NAVIGATION
========================================================= */

const pageTitles = {

  dashboard: "Dashboard",

  bugbounty: "Bug Bounty",

  content: "Content Creation",

  routine: "Personal Timetable",

  journal: "Daily Journal",

  settings: "Settings"

};


function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  document
    .getElementById(page)
    .classList.add("active");


  document
    .querySelectorAll(".nav")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.page === page
      );

    });


  document.getElementById("pageTitle").textContent =
    pageTitles[page];


  const action =
    document.getElementById("headerAction");

  if (page === "bugbounty") {

    action.textContent = "+ Add Target";

    action.onclick =
      () => openModal("targetModal");

  }

  else if (page === "content") {

    action.textContent = "+ Add Content";

    action.onclick =
      () => openModal("contentModal");

  }

  else if (page === "routine") {

    action.textContent = "+ Add Routine";

    action.onclick =
      () => openModal("routineModal");

  }

  else {

    action.textContent = "+ Add Target";

    action.onclick =
      () => openModal("targetModal");

  }


  if (page === "journal") {

    loadJournal();

  }

}


document
  .querySelectorAll(".nav")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      () => showPage(btn.dataset.page)
    );

  });


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

  document
    .getElementById(id)
    .classList.add("show");

}


function closeModal(id) {

  document
    .getElementById(id)
    .classList.remove("show");

}


/* =========================================================
   QUICK NOTE
========================================================= */

document
  .getElementById("quickNoteBtn")
  .onclick = () => openModal("quickNoteModal");


document
  .getElementById("saveQuickNote")
  .onclick = () => {

    const text =
      document
        .getElementById("quickNote")
        .value
        .trim();


    if (!text) return;


    db.quickNotes.push({

      id: uid(),

      text,

      date: today(),

      createdAt: new Date().toISOString()

    });


    document.getElementById("quickNote").value = "";

    saveDB();

    closeModal("quickNoteModal");

  };


/* =========================================================
   BUG BOUNTY — TARGETS
========================================================= */

document
  .getElementById("saveTarget")
  .onclick = () => {

    const name =
      document
        .getElementById("targetName")
        .value
        .trim();


    if (!name) {

      alert("Program name required.");

      return;

    }


    db.targets.push({

      id: uid(),

      name,

      platform:
        document
          .getElementById("targetPlatform")
          .value,

      url:
        document
          .getElementById("targetUrl")
          .value
          .trim(),

      scope:
        document
          .getElementById("targetScope")
          .value
          .trim(),

      priority:
        document
          .getElementById("targetPriority")
          .value,

      notes:
        document
          .getElementById("targetNotes")
          .value
          .trim(),

      created: today()

    });


    clearInputs("targetModal");

    closeModal("targetModal");

    saveDB();

  };


function deleteTarget(targetId) {

  if (!confirm("Delete this target?")) return;


  db.targets =
    db.targets.filter(
      t => t.id !== targetId
    );


  saveDB();

}


function renderTargets() {

  const container =
    document.getElementById("targetsList");


  const search =
    (
      document
        .getElementById("targetSearch")
        .value || ""
    ).toLowerCase();


  const platform =
    document
      .getElementById("targetPlatformFilter")
      .value;


  const targets =
    db.targets.filter(t => {

      const matchSearch =

        t.name
          .toLowerCase()
          .includes(search)

        ||

        t.scope
          .toLowerCase()
          .includes(search);


      const matchPlatform =

        platform === "all" ||
        t.platform === platform;


      return matchSearch && matchPlatform;

    });


  if (!targets.length) {

    container.innerHTML = `
      <div class="panel empty">
        No targets found.<br>
        Add your first bug bounty program.
      </div>
    `;

    return;

  }


  container.innerHTML =
    targets.map(t => `

      <div class="target-card">

        <div class="target-top">

          <div class="target-name">
            ${escapeHTML(t.name)}
          </div>

          <span class="badge">
            ${escapeHTML(t.platform)}
          </span>

        </div>


        <div class="meta">
          Scope:
          ${escapeHTML(t.scope || "Not specified")}
        </div>


        <div class="meta">
          Priority:
          ${escapeHTML(t.priority)}
        </div>


        <div class="meta">
          Added:
          ${escapeHTML(t.created)}
        </div>


        ${
          t.url
          ?
          `
            <div class="meta">
              <a
                href="${escapeHTML(t.url)}"
                target="_blank"
                style="color:#58a6ff">
                Open Program
              </a>
            </div>
          `
          :
          ""
        }


        ${
          t.notes
          ?
          `
            <div class="meta">
              Notes:
              ${escapeHTML(t.notes)}
            </div>
          `
          :
          ""
        }


        <div class="target-actions">

          <button
            class="small-btn"
            onclick="selectTarget('${t.id}')">
            🎯 Hunt
          </button>

          <button
            class="small-btn"
            onclick="deleteTarget('${t.id}')">
            Delete
          </button>

        </div>

      </div>

    `).join("");

}


document
  .getElementById("targetSearch")
  .addEventListener(
    "input",
    renderTargets
  );


document
  .getElementById("targetPlatformFilter")
  .addEventListener(
    "change",
    renderTargets
  );


function selectTarget(targetId) {

  document
    .getElementById("sessionTarget")
    .value = targetId;


  alert(
    "Target selected. Start the hunting session below."
  );

}


/* =========================================================
   FINDINGS
========================================================= */

document
  .getElementById("saveFinding")
  .onclick = () => {

    const title =
      document
        .getElementById("findingTitle")
        .value
        .trim();


    if (!title) {

      alert("Finding title required.");

      return;

    }


    db.findings.push({

      id: uid(),

      title,

      target:
        document
          .getElementById("findingTarget")
          .value
          .trim(),

      severity:
        document
          .getElementById("findingSeverity")
          .value,

      status:
        document
          .getElementById("findingStatus")
          .value,

      notes:
        document
          .getElementById("findingNotes")
          .value
          .trim(),

      date: today()

    });


    clearInputs("findingModal");

    closeModal("findingModal");

    saveDB();

  };


function deleteFinding(id) {

  db.findings =
    db.findings.filter(
      f => f.id !== id
    );

  saveDB();

}


function renderFindings() {

  const container =
    document.getElementById("findingsList");


  if (!db.findings.length) {

    container.innerHTML =
      `<div class="empty">
        No findings recorded yet.
      </div>`;

    return;

  }


  container.innerHTML =

    [...db.findings]
      .reverse()
      .map(f => `

        <div class="finding">

          <div class="finding-title">
            ${escapeHTML(f.title)}
          </div>

          <div class="severity">
            ${escapeHTML(f.severity)}
          </div>

          <div class="meta">
            Target:
            ${escapeHTML(f.target || "Unknown")}
          </div>

          <div class="meta">
            Status:
            ${escapeHTML(f.status)}
          </div>

          <div class="meta">
            ${escapeHTML(f.notes)}
          </div>

          <div class="meta">
            ${escapeHTML(f.date)}
          </div>

          <br>

          <button
            class="small-btn"
            onclick="deleteFinding('${f.id}')">
            Delete
          </button>

        </div>

      `)
      .join("");

}


/* =========================================================
   REPORTS
========================================================= */

document
  .getElementById("saveReport")
  .onclick = () => {

    const title =
      document
        .getElementById("reportTitle")
        .value
        .trim();


    if (!title) {

      alert("Report title required.");

      return;

    }


    db.reports.push({

      id: uid(),

      title,

      target:
        document
          .getElementById("reportTarget")
          .value
          .trim(),

      status:
        document
          .getElementById("reportStatus")
          .value,

      url:
        document
          .getElementById("reportUrl")
          .value
          .trim(),

      date: today()

    });


    clearInputs("reportModal");

    closeModal("reportModal");

    saveDB();

  };


function deleteReport(id) {

  db.reports =
    db.reports.filter(
      r => r.id !== id
    );

  saveDB();

}


function renderReports() {

  const container =
    document.getElementById("reportsList");


  if (!db.reports.length) {

    container.innerHTML =
      `<div class="empty">
        No reports recorded.
      </div>`;

    return;

  }


  container.innerHTML =

    [...db.reports]
      .reverse()
      .map(r => `

        <div class="target-card">

          <div class="target-top">

            <strong>
              ${escapeHTML(r.title)}
            </strong>

            <span class="badge">
              ${escapeHTML(r.status)}
            </span>

          </div>

          <div class="meta">
            Target:
            ${escapeHTML(r.target)}
          </div>

          <div class="meta">
            ${escapeHTML(r.date)}
          </div>


          ${
            r.url
            ?
            `
              <div class="meta">
                <a
                  href="${escapeHTML(r.url)}"
                  target="_blank"
                  style="color:#58a6ff">
                  Report Link
                </a>
              </div>
            `
            :
            ""
          }


          <br>

          <button
            class="small-btn"
            onclick="deleteReport('${r.id}')">
            Delete
          </button>

        </div>

      `)
      .join("");

}


/* =========================================================
   HUNTING SESSIONS
========================================================= */

let sessionTimer = null;

let sessionStart = null;

let currentSessionTarget = null;


document
  .getElementById("startSession")
  .onclick = startHunting;


document
  .getElementById("stopSession")
  .onclick = stopHunting;


function startHunting() {

  const target =
    document
      .getElementById("sessionTarget")
      .value;


  if (!target) {

    alert("Select a target first.");

    return;

  }


  if (sessionTimer) return;


  sessionStart = Date.now();

  currentSessionTarget = target;


  document
    .getElementById("startSession")
    .classList.add("hidden");


  document
    .getElementById("stopSession")
    .classList.remove("hidden");


  document
    .getElementById("sessionStatus")
    .textContent =
    "🔴 Hunting session active";


  sessionTimer =
    setInterval(updateTimer, 1000);


  updateTimer();

}


function updateTimer() {

  if (!sessionStart) return;


  const seconds =
    Math.floor(
      (Date.now() - sessionStart) / 1000
    );


  document
    .getElementById("timer")
    .textContent =
    formatTime(seconds);

}


function stopHunting() {

  if (!sessionStart) return;


  const duration =
    Math.floor(
      (Date.now() - sessionStart) / 1000
    );


  db.sessions.push({

    id: uid(),

    targetId:
      currentSessionTarget,

    date:
      today(),

    duration,

    start:
      sessionStart,

    end:
      Date.now()

  });


  clearInterval(sessionTimer);


  sessionTimer = null;

  sessionStart = null;

  currentSessionTarget = null;


  document
    .getElementById("timer")
    .textContent =
    "00:00:00";


  document
    .getElementById("sessionStatus")
    .textContent =
    "Session saved";


  document
    .getElementById("startSession")
    .classList.remove("hidden");


  document
    .getElementById("stopSession")
    .classList.add("hidden");


  saveDB();

}


function formatTime(totalSeconds) {

  const h =
    Math.floor(totalSeconds / 3600);

  const m =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const s =
    totalSeconds % 60;


  return [

    String(h).padStart(2, "0"),

    String(m).padStart(2, "0"),

    String(s).padStart(2, "0")

  ].join(":");

}


function renderSessionTargets() {

  const select =
    document.getElementById("sessionTarget");


  const current =
    select.value;


  select.innerHTML = `

    <option value="">
      Select target
    </option>

    ${
      db.targets.map(t => `

        <option value="${t.id}">
          ${escapeHTML(t.name)}
        </option>

      `).join("")
    }

  `;


  select.value = current;

}


function renderSessions() {

  const container =
    document.getElementById("sessionsList");


  if (!db.sessions.length) {

    container.innerHTML =
      `<div class="empty">
        No hunting sessions yet.
      </div>`;

    return;

  }


  container.innerHTML =

    [...db.sessions]
      .reverse()
      .map(s => {

        const target =
          db.targets.find(
            t => t.id === s.targetId
          );


        return `

          <div class="target-card">

            <strong>
              ${escapeHTML(
                target?.name || "Deleted target"
              )}
            </strong>

            <div class="meta">
              ${escapeHTML(s.date)}
            </div>

            <div class="meta">
              Duration:
              ${formatDuration(s.duration)}
            </div>

          </div>

        `;

      })
      .join("");

}


/* =========================================================
   CONTENT CREATION
========================================================= */

document
  .getElementById("saveContent")
  .onclick = () => {

    const title =
      document
        .getElementById("contentTitle")
        .value
        .trim();


    if (!title) {

      alert("Content title required.");

      return;

    }


    db.content.push({

      id: uid(),

      platform:
        document
          .getElementById("contentPlatform")
          .value,

      title,

      status:
        document
          .getElementById("contentStatus")
          .value,

      priority:
        document
          .getElementById("contentPriority")
          .value,

      notes:
        document
          .getElementById("contentNotes")
          .value
          .trim(),

      date: today()

    });


    clearInputs("contentModal");

    closeModal("contentModal");

    saveDB();

  };


function deleteContent(id) {

  db.content =
    db.content.filter(
      c => c.id !== id
    );

  saveDB();

}


function renderContent() {

  const container =
    document.getElementById("contentList");


  const youtube =
    db.content.filter(
      c => c.platform === "YouTube"
    ).length;


  const instagram =
    db.content.filter(
      c => c.platform === "Instagram"
    ).length;


  const twitter =
    db.content.filter(
      c => c.platform === "Twitter / X"
    ).length;


  document.getElementById("youtubeCount")
    .textContent =
    `${youtube} items`;


  document.getElementById("instagramCount")
    .textContent =
    `${instagram} items`;


  document.getElementById("twitterCount")
    .textContent =
    `${twitter} items`;


  if (!db.content.length) {

    container.innerHTML =
      `<div class="empty">
        No content planned yet.
      </div>`;

    return;

  }


  container.innerHTML =

    [...db.content]
      .reverse()
      .map(c => `

        <div class="content-item">

          <div class="content-item-top">

            <strong>
              ${escapeHTML(c.title)}
            </strong>

            <span class="content-status">
              ${escapeHTML(c.status)}
            </span>

          </div>

          <div class="meta">
            ${escapeHTML(c.platform)}
            · Priority:
            ${escapeHTML(c.priority)}
          </div>

          ${
            c.notes
            ?
            `
              <div class="meta">
                ${escapeHTML(c.notes)}
              </div>
            `
            :
            ""
          }

          <div class="meta">
            ${escapeHTML(c.date)}
          </div>

          <br>

          <button
            class="small-btn"
            onclick="deleteContent('${c.id}')">
            Delete
          </button>

        </div>

      `)
      .join("");

}


function renderDashboardContent() {

  const container =
    document.getElementById("dashboardContent");


  const items =
    [...db.content]
      .filter(c => c.status !== "Posted")
      .reverse()
      .slice(0, 5);


  if (!items.length) {

    container.innerHTML =
      `<div class="empty">
        No pending content.
      </div>`;

    return;

  }


  container.innerHTML =
    items.map(c => `

      <div class="content-item">

        <div class="content-item-top">

          <strong>
            ${escapeHTML(c.title)}
          </strong>

          <span class="content-status">
            ${escapeHTML(c.platform)}
          </span>

        </div>

        <div class="meta">
          Status: ${escapeHTML(c.status)}
        </div>

      </div>

    `).join("");

}


/* =========================================================
   PERSONAL ROUTINE
========================================================= */

document
  .getElementById("saveRoutine")
  .onclick = () => {

    const title =
      document
        .getElementById("routineTitle")
        .value
        .trim();


    if (!title) {

      alert("Routine name required.");

      return;

    }


    db.routine.push({

      id: uid(),

      time:
        document
          .getElementById("routineTime")
          .value || "09:00",

      title,

      description:
        document
          .getElementById("routineDescription")
          .value
          .trim(),

      active: true

    });


    clearInputs("routineModal");

    closeModal("routineModal");

    saveDB();

  };


function toggleRoutine(id) {

  const date = today();


  if (!db.routineChecks[date]) {

    db.routineChecks[date] = {};

  }


  db.routineChecks[date][id] =
    !db.routineChecks[date][id];


  saveDB();

}


function deleteRoutine(id) {

  db.routine =
    db.routine.filter(
      r => r.id !== id
    );


  if (db.routineChecks[today()]) {

    delete db.routineChecks[today()][id];

  }


  saveDB();

}


function renderRoutine() {

  const container =
    document.getElementById("routineList");


  const routines =
    [...db.routine]
      .filter(r => r.active !== false)
      .sort(
        (a, b) =>
          a.time.localeCompare(b.time)
      );


  const checks =
    db.routineChecks[today()] || {};


  if (!routines.length) {

    container.innerHTML =
      `<div class="empty">
        No routine added.<br>
        Add your normal daily timetable.
      </div>`;

    updateRoutineProgress();

    return;

  }


  container.innerHTML =

    routines.map(r => {

      const checked =
        checks[r.id] === true;


      return `

        <div class="routine-item ${
          checked ? "done" : ""
        }">

          <div class="routine-time">
            ${escapeHTML(r.time)}
          </div>


          <input
            type="checkbox"
            class="routine-check"
            ${checked ? "checked" : ""}
            onchange="toggleRoutine('${r.id}')">


          <div>

            <div class="routine-title">
              ${escapeHTML(r.title)}
            </div>

            <div class="routine-desc">
              ${escapeHTML(r.description)}
            </div>

          </div>


          <button
            class="small-btn"
            onclick="deleteRoutine('${r.id}')">
            Delete
          </button>

        </div>

      `;

    }).join("");


  updateRoutineProgress();

}


function updateRoutineProgress() {

  const routines =
    db.routine.filter(
      r => r.active !== false
    );


  const checks =
    db.routineChecks[today()] || {};


  const total =
    routines.length;


  const completed =
    routines.filter(
      r => checks[r.id]
    ).length;


  const percent =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );


  document.getElementById("routinePercent")
    .textContent =
    `${percent}%`;


  document.getElementById("routineProgressBar")
    .style.width =
    `${percent}%`;


  document.getElementById("routineCount")
    .textContent =
    `${completed} / ${total} completed`;


  document.getElementById("dashRoutine")
    .textContent =
    `${percent}%`;

}


function renderDashboardRoutine() {

  const container =
    document.getElementById("dashboardRoutine");


  const routines =
    [...db.routine]
      .sort(
        (a, b) =>
          a.time.localeCompare(b.time)
      )
      .slice(0, 6);


  const checks =
    db.routineChecks[today()] || {};


  if (!routines.length) {

    container.innerHTML =
      `<div class="empty">
        No routine added.
      </div>`;

    return;

  }


  container.innerHTML =

    routines.map(r => `

      <div class="routine-item ${
        checks[r.id] ? "done" : ""
      }">

        <div class="routine-time">
          ${escapeHTML(r.time)}
        </div>

        <input
          type="checkbox"
          class="routine-check"
          ${checks[r.id] ? "checked" : ""}
          onchange="toggleRoutine('${r.id}')">

        <div>

          <div class="routine-title">
            ${escapeHTML(r.title)}
          </div>

        </div>

      </div>

    `).join("");

}


/* =========================================================
   JOURNAL
========================================================= */

document
  .getElementById("journalDate")
  .value = today();


document
  .getElementById("journalDate")
  .addEventListener(
    "change",
    loadJournal
  );


function loadJournal() {

  const date =
    document
      .getElementById("journalDate")
      .value;


  const j =
    db.journals[date] || {};


  document.getElementById("journalWork")
    .value =
    j.work || "";


  document.getElementById("journalLearn")
    .value =
    j.learn || "";


  document.getElementById("journalNotes")
    .value =
    j.notes || "";


  document.getElementById("journalTomorrow")
    .value =
    j.tomorrow || "";

}


document
  .getElementById("saveJournal")
  .onclick = () => {

    const date =
      document
        .getElementById("journalDate")
        .value;


    db.journals[date] = {

      work:
        document
          .getElementById("journalWork")
          .value,

      learn:
        document
          .getElementById("journalLearn")
          .value,

      notes:
        document
          .getElementById("journalNotes")
          .value,

      tomorrow:
        document
          .getElementById("journalTomorrow")
          .value

    };


    saveDB();

    alert("Journal saved.");

  };


/* =========================================================
   DASHBOARD
========================================================= */

function formatDuration(seconds) {

  const hours =
    Math.floor(seconds / 3600);

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );


  return `${hours}h ${minutes}m`;

}


function renderDashboard() {

  document.getElementById("dashTargets")
    .textContent =
    db.targets.length;


  const seconds =
    db.sessions.reduce(
      (sum, s) =>
        sum + Number(s.duration || 0),
      0
    );


  document.getElementById("dashTime")
    .textContent =
    formatDuration(seconds);


  document.getElementById("dashFindings")
    .textContent =
    db.findings.length;


  document.getElementById("dashReports")
    .textContent =
    db.reports.length;


  document.getElementById("dashContent")
    .textContent =
    db.content.filter(
      c => c.status !== "Posted"
    ).length;


  renderDashboardTarget();

  renderDashboardRoutine();

  renderDashboardContent();

  renderDashboardFindings();

}


function renderDashboardTarget() {

  const box =
    document.getElementById("dashboardTarget");


  const session =
    [...db.sessions].reverse()[0];


  if (!session) {

    box.innerHTML =
      `<div class="empty">
        No hunting session yet.
      </div>`;

    return;

  }


  const target =
    db.targets.find(
      t => t.id === session.targetId
    );


  if (!target) {

    box.innerHTML =
      `<div class="empty">
        Target no longer exists.
      </div>`;

    return;

  }


  box.innerHTML = `

    <div class="target-card">

      <div class="target-top">

        <div class="target-name">
          ${escapeHTML(target.name)}
        </div>

        <span class="badge">
          ${escapeHTML(target.platform)}
        </span>

      </div>

      <div class="meta">
        Scope:
        ${escapeHTML(target.scope)}
      </div>

      <div class="meta">
        Last hunted:
        ${escapeHTML(session.date)}
      </div>

      <div class="meta">
        Session:
        ${formatDuration(session.duration)}
      </div>

    </div>

  `;

}


function renderDashboardFindings() {

  const box =
    document.getElementById("dashboardFindings");


  const findings =
    [...db.findings]
      .reverse()
      .slice(0, 4);


  if (!findings.length) {

    box.innerHTML =
      `<div class="empty">
        No findings yet.
      </div>`;

    return;

  }


  box.innerHTML =

    findings.map(f => `

      <div class="finding">

        <div class="finding-title">
          ${escapeHTML(f.title)}
        </div>

        <div class="severity">
          ${escapeHTML(f.severity)}
        </div>

        <div class="meta">
          ${escapeHTML(f.target)}
        </div>

      </div>

    `).join("");

}


/* =========================================================
   BUG BOUNTY TABS
========================================================= */

document
  .querySelectorAll(".tab")
  .forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".tab")
          .forEach(x =>
            x.classList.remove("active")
          );


        document
          .querySelectorAll(".tab-content")
          .forEach(x =>
            x.classList.remove("active")
          );


        tab.classList.add("active");


        document
          .getElementById(tab.dataset.tab)
          .classList.add("active");

      }
    );

  });


/* =========================================================
   UTILITIES
========================================================= */

function clearInputs(modalId) {

  document
    .getElementById(modalId)
    .querySelectorAll(
      "input:not([type=checkbox]), textarea"
    )
    .forEach(input => {

      input.value = "";

    });

}


function refresh() {

  renderTargets();

  renderFindings();

  renderReports();

  renderSessions();

  renderSessionTargets();

  renderContent();

  renderRoutine();

  renderDashboard();

}


/* =========================================================
   EXPORT
========================================================= */

function exportData() {

  const data =
    JSON.stringify(db, null, 2);


  const blob =
    new Blob(
      [data],
      { type: "application/json" }
    );


  const url =
    URL.createObjectURL(blob);


  const a =
    document.createElement("a");


  a.href = url;

  a.download =
    `bug-hunting-os-backup-${today()}.json`;


  a.click();


  URL.revokeObjectURL(url);

}


document
  .getElementById("importFile")
  .addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file) return;


      const reader =
        new FileReader();


      reader.onload = () => {

        try {

          const imported =
            JSON.parse(reader.result);


          if (
            !imported ||
            typeof imported !== "object"
          ) {

            throw new Error();

          }


          db = imported;

          saveDB();

          alert("Backup imported successfully.");

        }

        catch {

          alert("Invalid backup file.");

        }

      };


      reader.readAsText(file);

    }
  );


/* =========================================================
   DELETE EVERYTHING
========================================================= */

function clearAllData() {

  const confirmDelete =
    confirm(
      "This will delete ALL your data. Continue?"
    );


  if (!confirmDelete) return;


  localStorage.removeItem(STORAGE_KEY);


  location.reload();

}


/* =========================================================
   FIRST RUN DEFAULT ROUTINE
========================================================= */

function createDefaultRoutine() {

  if (db.routine.length) return;


  db.routine = [

    {
      id: uid(),
      time: "06:30",
      title: "Wake Up",
      description: "Start the day",
      active: true
    },

    {
      id: uid(),
      time: "07:00",
      title: "Exercise",
      description: "Workout / walk",
      active: true
    },

    {
      id: uid(),
      time: "08:00",
      title: "Study / Learning",
      description: "Learning and revision",
      active: true
    },

    {
      id: uid(),
      time: "10:00",
      title: "Bug Hunting",
      description: "Focused security research",
      active: true
    },

    {
      id: uid(),
      time: "13:00",
      title: "Lunch / Break",
      description: "Take a proper break",
      active: true
    },

    {
      id: uid(),
      time: "14:00",
      title: "Bug Hunting",
      description: "Continue testing",
      active: true
    },

    {
      id: uid(),
      time: "18:00",
      title: "Content Creation",
      description: "YouTube / Instagram / X",
      active: true
    },

    {
      id: uid(),
      time: "20:00",
      title: "Personal Work",
      description: "Personal tasks",
      active: true
    },

    {
      id: uid(),
      time: "21:00",
      title: "Revision / Research",
      description: "Review today's work",
      active: true
    },

    {
      id: uid(),
      time: "23:00",
      title: "Day Review",
      description: "Journal and plan tomorrow",
      active: true
    },

    {
      id: uid(),
      time: "23:30",
      title: "Sleep",
      description: "End the day",
      active: true
    }

  ];


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(db)
  );

}


/* =========================================================
   START APPLICATION
========================================================= */

createDefaultRoutine();

refresh();

loadJournal();
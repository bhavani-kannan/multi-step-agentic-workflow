const demoData = {
  routes: {
    cache: {
      title: "Cache or dashboard rendering issue",
      nextAction:
        "Attempt controlled dashboard refresh and verify whether the freshness timestamp changes before deeper platform investigation."
    },
    gateway: {
      title: "Gateway or token issue",
      nextAction:
        "Check gateway session validity, token expiry, and connector authentication path before assuming the pipeline itself failed."
    },
    pipeline: {
      title: "Pipeline execution issue",
      nextAction:
        "Use the resolved platform toolset to inspect run history, execution status, and downstream freshness state."
    },
    source: {
      title: "Source system freshness issue",
      nextAction:
        "Validate whether upstream source extracts arrived on time before triggering pipeline reruns."
    },
    infra: {
      title: "Infrastructure dependency issue",
      nextAction:
        "Validate connector, certificate, network path, or dependency health if platform evidence suggests downstream access failure."
    }
  },

  ownershipModels: {
    "multi-vendor": [
      "L0: Service Desk Vendor",
      "L1: Reporting Support Vendor",
      "L2: Data Platform Vendor",
      "L3: Internal Infrastructure Team",
      "Business: Reporting Product Owner"
    ],
    internal: [
      "L0: Enterprise Service Desk",
      "L1: Analytics Support Team",
      "L2: Data Engineering Team",
      "L3: Platform Reliability Team",
      "Business: Dashboard Owner"
    ],
    hybrid: [
      "L0: Enterprise Service Desk",
      "L1: External Dashboard Support Vendor",
      "L2: Internal Data Engineering Team",
      "L3: Cloud Infrastructure Team",
      "Business: Product Owner"
    ]
  },

  platformToolsets: {
    snowflake: [
      "Snowflake Task History API",
      "Warehouse Health Metrics",
      "Failed Query Logs",
      "Downstream Table Freshness Check"
    ],
    databricks: [
      "Databricks Workflow Run History",
      "Cluster Health Logs",
      "Notebook Error Trace",
      "Delta Table Freshness Check"
    ],
    airflow: [
      "Airflow DAG Run Status",
      "Scheduler Health",
      "Task Retry Logs",
      "Upstream Dependency Status"
    ],
    adf: [
      "ADF Pipeline Monitoring",
      "Activity Run Logs",
      "Linked Service Health",
      "Dataflow Output Validation"
    ],
    custom: [
      "Scheduler State Logs",
      "Connector Health Check",
      "Batch Job Logs",
      "Output Freshness Validation"
    ]
  },

  scenarios: {
    "finance-snowflake": {
      metadata: {
        incidentId: "INC-DBD-7834521",
        createdBy: "maria.gomez@domain.com",
        openedAt: "2026-03-06 09:12 AM",
        priority: "P2",
        affectedDomain: "Finance",
        affectedUsers: "7"
      },
      ticketTitle: "Finance dashboard numbers not updated since scheduled refresh",
      ticketDescription:
        "Revenue and month-to-date finance metrics appear unchanged since morning. Users are unsure whether the dashboard refresh failed, the pipeline did not complete, or source data did not arrive.",
      humanFirstLook: [
        "Read the ticket carefully and interpret imperfect wording or missing technical detail.",
        "Identify the likely dashboard and confirm whether this is a stale-data complaint or a visual issue.",
        "Check whether the ticket clearly states urgency and user impact."
      ],
      agentExtraction: [
        "Candidate dashboard: Finance Executive Scorecard",
        "Signal extracted: stale data or refresh not completed",
        "Affected user clue: 7 users",
        "Priority clue: leadership reporting impact"
      ],
      platform: "snowflake",
      ownership: "multi-vendor",
      routeRanking: [
        { key: "pipeline", score: 86 },
        { key: "gateway", score: 48 },
        { key: "infra", score: 39 },
        { key: "source", score: 34 }
      ],
      storyTimeline: [
        "Incident arrives from finance reporting users complaining that dashboard numbers are stale.",
        "Human triage interprets the issue as a likely freshness problem rather than a display bug.",
        "Agent uses enterprise context memory to resolve the affected dashboard to a Snowflake-backed data product.",
        "Platform-specific investigation begins with Snowflake task history and downstream freshness checks.",
        "Pipeline route ranks highest, but alternate routes remain visible if evidence changes.",
        "Ownership chain shows separate vendors and internal teams for different escalation layers."
      ],
      finalResolution: [
        "Leading route: Pipeline execution issue",
        "Recommended action: Validate Snowflake task delay or failure before rerun",
        "Escalation chain: Service Desk Vendor -> Reporting Support Vendor -> Data Platform Vendor -> Internal Infrastructure Team"
      ],
      workflow: [
        {
          id: "H1",
          title: "Service desk receives ticket and interprets the incident description",
          body:
            "Human reads the ticket, resolves unclear wording, identifies probable dashboard name, stale-data clue, and impact clue.",
          alternates: [
            "The ticket may refer to a business nickname instead of the technical dashboard name.",
            "The complaint may describe stale numbers without saying whether refresh failed.",
            "Urgency may be underreported even when leadership reporting is affected."
          ],
          tasks: [
            {
              id: "A1.1",
              title: "Retrieve incident record from ServiceNow",
              context: "Ticket ID, number, caller, description, short description, priority, state, opened_at",
              tools: "ServiceNow Incident API from enterprise context memory",
              guardrails: "Use correct environment and standard timeout controls",
              output: "Raw incident object loaded into working memory"
            },
            {
              id: "A1.2",
              title: "Parse description and extract dashboard, stale-data clue, and impact clue",
              context: "Incident description text and known dashboard naming patterns",
              tools: "Internal NLP parser and dashboard dictionary",
              guardrails: "Low-confidence extraction must remain visible for analyst review",
              output: "Candidate dashboard name, stale-data signal, impacted-user estimate"
            }
          ]
        },
        {
          id: "H2",
          title: "Analyst determines which business and technical asset chain the ticket belongs to",
          body:
            "Human checks what dashboard, semantic model, data product, and platform are likely involved. This is where platform independence matters.",
          alternates: [
            "The same symptom may map to Snowflake for one dashboard and Databricks for another.",
            "A single business dashboard may depend on more than one pipeline path.",
            "The issue may actually sit in the semantic layer rather than the pipeline."
          ],
          tasks: [
            {
              id: "A2.1",
              title: "Resolve dashboard lineage from business asset to technical asset chain",
              context: "Candidate dashboard name, asset registry mappings, semantic model references",
              tools: "Enterprise context memory and lineage registry",
              guardrails: "Do not assume a platform before lineage resolution succeeds",
              output: "Resolved asset chain from dashboard to pipeline platform"
            },
            {
              id: "A2.2",
              title: "Determine which platform-specific toolset applies",
              context: "Resolved platform, mapped pipeline, ownership metadata",
              tools: "Platform tool registry from enterprise context memory",
              guardrails: "Only use toolsets that belong to the resolved platform path",
              output: "Correct platform toolset selected instead of random tool usage"
            }
          ]
        },
        {
          id: "H3",
          title: "Analyst verifies whether the stale-data symptom is real and reproducible",
          body:
            "Human attempts validation. If refresh succeeds, a cache or rendering issue becomes stronger. If it fails or remains stale, deeper platform checks are needed.",
          alternates: [
            "Manual refresh may succeed, which strengthens the cache or rendering route.",
            "Refresh may fail, but the cause may still be token, gateway, or source latency.",
            "Different user roles may observe different behavior."
          ],
          tasks: [
            {
              id: "A3.1",
              title: "Check whether the symptom is reproducible",
              context: "Dashboard URL, freshness timestamp, semantic refresh state",
              tools: "Dashboard refresh control and freshness check",
              guardrails: "Do not treat a single complaint as confirmed failure without validation",
              output: "Validated symptom state: stale, partially stale, or recovered"
            },
            {
              id: "A3.2",
              title: "Separate cache issue from real data freshness issue",
              context: "Manual refresh outcome and downstream freshness clues",
              tools: "Freshness validation and semantic status checks",
              guardrails: "Keep alternate paths open until evidence eliminates them",
              output: "Initial split between cache route and deeper technical routes"
            }
          ]
        },
        {
          id: "H4",
          title: "Analyst reviews logs and run history using the correct platform-specific tools",
          body:
            "Which logs are checked depends on the resolved platform. The agent should not jump randomly. It should use context memory to select the right platform toolset.",
          alternates: [
            "Snowflake may show task delay, failure, or successful run with stale tables.",
            "Databricks may show workflow failure, cluster instability, or notebook retry issues.",
            "Airflow, ADF, or custom platforms may require entirely different logs.",
            "If platform logs are healthy, the route may shift to source or infrastructure."
          ],
          tasks: [
            {
              id: "A4.1",
              title: "Inspect platform-specific run history and logs",
              context: "Resolved platform and mapped pipeline references",
              tools: "Platform-specific toolset selected from context memory",
              guardrails: "Do not inspect unrelated platform logs",
              output: "Platform-specific evidence collected from the correct system"
            },
            {
              id: "A4.2",
              title: "Compare live evidence with similar historical incidents",
              context: "Current failure signature and prior incident patterns",
              tools: "Historical similarity engine and incident knowledge base",
              guardrails: "Similarity informs ranking but does not replace live validation",
              output: "Route confidence updated using live and historical evidence"
            }
          ]
        },
        {
          id: "H5",
          title: "Analyst decides which resolution path is most likely",
          body:
            "Human uses evidence to distinguish among cache, gateway, pipeline, source, and infrastructure routes. More than one valid route may remain plausible.",
          alternates: [
            "More than one route may remain plausible at the same time.",
            "A route that ranked second earlier may become the top route later.",
            "Historical similarity may suggest one path while live evidence strengthens another."
          ],
          tasks: [
            {
              id: "A5.1",
              title: "Rank multiple candidate routes",
              context: "Live evidence, historical similarity, refresh validation, run status",
              tools: "Internal route ranking engine",
              guardrails: "Do not collapse all uncertainty into one route too early",
              output: "Ranked cache, gateway, pipeline, source, and infrastructure routes"
            },
            {
              id: "A5.2",
              title: "Keep alternate paths visible for the analyst",
              context: "Top route plus secondary candidate routes",
              tools: "Decision support layer",
              guardrails: "This demo must not look like a rigid SOP with only one answer",
              output: "Primary route recommended while alternate routes remain visible"
            }
          ]
        },
        {
          id: "H6",
          title: "Analyst routes the issue to the correct owner or resolution team",
          body:
            "Ownership is not fixed. Depending on the support model, L1 may be one vendor, L2 another, and L3 an internal team. The agent prepares the correct handoff context.",
          alternates: [
            "L1, L2, and L3 may belong to different vendors or internal teams.",
            "The same route may escalate differently depending on support model.",
            "The handoff package must explain why a particular team is the right next owner."
          ],
          tasks: [
            {
              id: "A6.1",
              title: "Resolve escalation chain from ownership model and route",
              context: "Resolved route, support model, system ownership metadata",
              tools: "Ownership registry and escalation mapping",
              guardrails: "Different routes may require different owner chains",
              output: "Correct L1, L2, and L3 chain identified for this incident"
            },
            {
              id: "A6.2",
              title: "Prepare structured context pack for handoff",
              context: "Incident record, lineage chain, platform evidence, route ranking, alternates",
              tools: "Context pack assembler",
              guardrails: "Handoff must include evidence, rationale, and alternate path visibility",
              output: "Ready-to-send escalation package for the next responsible owner"
            }
          ]
        }
      ]
    }
  }
};

const el = {
  incidentId: document.getElementById("incidentId"),
  createdBy: document.getElementById("createdBy"),
  openedAt: document.getElementById("openedAt"),
  priority: document.getElementById("priority"),
  affectedDomain: document.getElementById("affectedDomain"),
  affectedUsers: document.getElementById("affectedUsers"),

  ticketTitle: document.getElementById("ticketTitle"),
  ticketDescription: document.getElementById("ticketDescription"),
  humanFirstLook: document.getElementById("humanFirstLook"),
  agentExtraction: document.getElementById("agentExtraction"),

  workflowCanvas: document.getElementById("workflowCanvas"),

  routeCandidates: document.getElementById("routeCandidates"),
  recommendedNextAction: document.getElementById("recommendedNextAction"),
  escalationTarget: document.getElementById("escalationTarget"),

  storyTimeline: document.getElementById("storyTimeline"),
  finalResolution: document.getElementById("finalResolution")
};

const state = {
  scenario: "finance-snowflake"
};

function currentScenario() {
  return demoData.scenarios[state.scenario];
}

function addListItems(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
  });
}

function addStackItems(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.textContent = item;
    node.appendChild(div);
  });
}

function renderMetadata() {
  const s = currentScenario();
  el.incidentId.textContent = s.metadata.incidentId;
  el.createdBy.textContent = s.metadata.createdBy;
  el.openedAt.textContent = s.metadata.openedAt;
  el.priority.textContent = s.metadata.priority;
  el.affectedDomain.textContent = s.metadata.affectedDomain;
  el.affectedUsers.textContent = s.metadata.affectedUsers;
}

function renderTicket() {
  const s = currentScenario();
  el.ticketTitle.textContent = s.ticketTitle;
  el.ticketDescription.textContent = s.ticketDescription;
  addListItems(el.humanFirstLook, s.humanFirstLook);
  addListItems(el.agentExtraction, s.agentExtraction);
}

function createTaskCard(task) {
  return `
    <div class="agent-task-card">
      <div class="step-id">${task.id}</div>
      <div class="step-title">${task.title}</div>
      <div class="task-meta-grid">
        <div>
          <h4>Context Window Needed</h4>
          <p>${task.context}</p>
        </div>
        <div>
          <h4>Tools / API</h4>
          <p>${task.tools}</p>
        </div>
        <div>
          <h4>Guardrails</h4>
          <p>${task.guardrails}</p>
        </div>
        <div>
          <h4>Output</h4>
          <p>${task.output}</p>
        </div>
      </div>
    </div>
  `;
}

function renderWorkflow() {
  const s = currentScenario();
  el.workflowCanvas.innerHTML = "";

  s.workflow.forEach((step, index) => {
    const block = document.createElement("div");
    block.className = `workflow-block${index === 0 ? " open" : ""}`;

    block.innerHTML = `
      <button class="workflow-accordion" type="button">
        <div class="workflow-accordion-left">
          <div class="step-id">${step.id} - Human Process Step</div>
          <div class="step-title">${step.title}</div>
          <div class="step-body">${step.body}</div>
        </div>
        <div class="accordion-icon">+</div>
      </button>

      <div class="workflow-content">
        <div class="agent-section-title">Corresponding Agent Tasks</div>
        <div class="agent-task-grid">
          ${step.tasks.map(createTaskCard).join("")}
        </div>

        <div class="alternate-path-box">
          <div class="alternate-title">Alternate scenarios to consider at this step</div>
          <ul class="plain-list">
            ${step.alternates.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    el.workflowCanvas.appendChild(block);
  });

  document.querySelectorAll(".workflow-accordion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const block = btn.parentElement;
      block.classList.toggle("open");
    });
  });
}

function renderOutcome() {
  const s = currentScenario();

  el.routeCandidates.innerHTML = "";
  s.routeRanking.forEach((item, index) => {
    const route = demoData.routes[item.key];
    const card = document.createElement("div");
    card.className = `route-card${index === 0 ? " active" : ""}`;
    card.innerHTML = `
      <h4>${route.title}</h4>
      <div class="route-score">${item.score}% confidence</div>
      <div>${route.nextAction}</div>
    `;
    el.routeCandidates.appendChild(card);
  });

  const topRoute = demoData.routes[s.routeRanking[0].key];
  el.recommendedNextAction.textContent = topRoute.nextAction;
  addStackItems(el.escalationTarget, demoData.ownershipModels[s.ownership]);
}

function renderWalkthrough() {
  const s = currentScenario();
  addStackItems(el.storyTimeline, s.storyTimeline);
  addStackItems(el.finalResolution, s.finalResolution);
}

function renderAll() {
  renderMetadata();
  renderTicket();
  renderWorkflow();
  renderOutcome();
  renderWalkthrough();
}

renderAll();
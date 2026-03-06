const demoData = {
  routes: {
    cache: {
      title: "Cache or dashboard rendering issue",
      description:
        "Dashboard refresh control or semantic refresh appears recoverable without clear pipeline failure.",
      nextAction:
        "Attempt controlled dashboard refresh and verify whether the freshness timestamp changes before deeper platform investigation."
    },
    gateway: {
      title: "Gateway or token issue",
      description:
        "Connector session, token validity, or integration handshake looks more likely than a core pipeline failure.",
      nextAction:
        "Check gateway session validity, token expiry, and connector authentication path before assuming the pipeline itself failed."
    },
    pipeline: {
      title: "Pipeline execution issue",
      description:
        "Platform run history suggests the mapped refresh chain failed, stalled, or only partially completed.",
      nextAction:
        "Use the resolved platform toolset to inspect run history, execution status, and downstream freshness state."
    },
    source: {
      title: "Source system freshness issue",
      description:
        "Upstream source arrival may be delayed even when the reporting platform is healthy.",
      nextAction:
        "Validate whether upstream source extracts arrived on time before triggering pipeline reruns."
    },
    infra: {
      title: "Infrastructure dependency issue",
      description:
        "Connector, certificate, network path, or dependency failure looks stronger than a pipeline-only issue.",
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
      defaultState: {
        platform: "snowflake",
        ownership: "multi-vendor",
        reproducibility: "still-stale",
        route: "pipeline"
      },
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
              output: "Raw incident object loaded into working memory",
              thinking: [
                "Is the incident payload complete enough for automated parsing?",
                "Is the affected environment or CI mentioned clearly enough?",
                "Should the agent flag missing fields before moving forward?"
              ],
              decisions: [
                {
                  id: "complete-record",
                  label: "Record is complete enough to continue",
                  outcome:
                    "Proceed to description parsing and entity extraction without asking for clarification.",
                  chosen: true
                },
                {
                  id: "missing-fields",
                  label: "Record has missing fields",
                  outcome:
                    "Continue with partial parsing but keep a clarification request ready if confidence drops.",
                  chosen: false
                }
              ],
              selectedDecision: "complete-record",
              handoff: {
                owner: "No reassignment yet",
                reason: "Still in intake and parsing stage",
                route: "Initial triage"
              }
            },
            {
              id: "A1.2",
              title: "Parse description and extract dashboard, stale-data clue, and impact clue",
              context: "Incident description text and known dashboard naming patterns",
              tools: "Internal NLP parser and dashboard dictionary",
              guardrails: "Low-confidence extraction must remain visible for analyst review",
              output: "Candidate dashboard name, stale-data signal, impacted-user estimate",
              thinking: [
                "Is the dashboard explicitly named, or only described in business language?",
                "Does the wording imply stale data, refresh failure, or source delay?",
                "How confident is the extraction before deeper routing starts?"
              ],
              decisions: [
                {
                  id: "high-confidence-parse",
                  label: "High-confidence parse",
                  outcome:
                    "Use extracted dashboard candidate directly in enterprise context lookup.",
                  chosen: true
                },
                {
                  id: "low-confidence-parse",
                  label: "Low-confidence parse",
                  outcome:
                    "Keep multiple dashboard candidates active until lineage resolution confirms the right one.",
                  chosen: false
                }
              ],
              selectedDecision: "high-confidence-parse",
              handoff: {
                owner: "No reassignment yet",
                reason: "Still in intake interpretation",
                route: "Context lookup next"
              }
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
              output: "Resolved asset chain from dashboard to pipeline platform",
              thinking: [
                "Which dashboard or semantic asset does the ticket most likely refer to?",
                "Does lineage map cleanly to one platform, or are multiple technical paths possible?",
                "Should alternate platform paths remain visible until confidence improves?"
              ],
              decisionType: "platform",
              handoff: {
                owner: "Still with triage and context resolution",
                reason: "Agent must resolve platform before selecting logs and routes",
                route: "Platform determination"
              }
            },
            {
              id: "A2.2",
              title: "Determine which platform-specific toolset applies",
              context: "Resolved platform, mapped pipeline, ownership metadata",
              tools: "Platform tool registry from enterprise context memory",
              guardrails: "Only use toolsets that belong to the resolved platform path",
              output: "Correct platform toolset selected instead of random tool usage",
              thinking: [
                "If this is Snowflake, task history and freshness checks matter most.",
                "If this is Databricks, workflow history, cluster logs, and notebook traces matter most.",
                "The same stale-data complaint should not force one hardcoded platform path."
              ],
              decisionType: "platform-summary",
              handoff: {
                owner: "No reassignment yet",
                reason: "Toolset selection remains internal to the agent at this stage",
                route: "Prepare validation checks"
              }
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
              output: "Validated symptom state: stale, partially stale, or recovered",
              thinking: [
                "Does manual validation confirm that the dashboard is still stale?",
                "Did refresh succeed but fail to change the data timestamp?",
                "Is the symptom partial, where only some widgets or measures are stale?"
              ],
              decisionType: "reproducibility",
              handoff: {
                owner: "No reassignment yet",
                reason: "The agent still needs evidence before route escalation",
                route: "Validation first"
              }
            },
            {
              id: "A3.2",
              title: "Separate cache issue from real data freshness issue",
              context: "Manual refresh outcome and downstream freshness clues",
              tools: "Freshness validation and semantic status checks",
              guardrails: "Keep alternate paths open until evidence eliminates them",
              output: "Initial split between cache route and deeper technical routes",
              thinking: [
                "If manual refresh recovered the dashboard, cache becomes stronger.",
                "If the dashboard remains stale, deeper platform or source routes stay active.",
                "The agent must avoid locking into a single route too early."
              ],
              decisionType: "route-preview",
              handoff: {
                owner: "No reassignment yet",
                reason: "Still building route confidence before handoff",
                route: "Route preview"
              }
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
              output: "Platform-specific evidence collected from the correct system",
              thinking: [
                "Which log source is correct for the resolved platform?",
                "Do the logs show outright failure, delay, partial success, or healthy runs?",
                "Should this evidence strengthen pipeline, infra, or source routes?"
              ],
              decisionType: "platform-evidence",
              handoff: {
                owner: "No reassignment yet",
                reason: "Evidence gathering remains in-flight",
                route: "Evidence collection"
              }
            },
            {
              id: "A4.2",
              title: "Compare live evidence with similar historical incidents",
              context: "Current failure signature and prior incident patterns",
              tools: "Historical similarity engine and incident knowledge base",
              guardrails: "Similarity informs ranking but does not replace live validation",
              output: "Route confidence updated using live and historical evidence",
              thinking: [
                "Do similar incidents on this dashboard usually point to pipeline or gateway issues?",
                "Is historical similarity reinforcing the live evidence or contradicting it?",
                "Should the route board remain broad or start narrowing?"
              ],
              decisionType: "route",
              handoff: {
                owner: "Still internal to triage",
                reason: "Route ranking is being finalized from evidence",
                route: "Decisioning"
              }
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
              output: "Ranked cache, gateway, pipeline, source, and infrastructure routes",
              decisionType: "route",
              thinking: [
                "Which route best explains the evidence collected so far?",
                "Which route remains second strongest if the top route weakens later?",
                "How visible should alternate routes remain for the analyst?"
              ],
              handoff: {
                owner: "Decision support layer",
                reason: "No team handoff until the route is strong enough",
                route: "Route ranking"
              }
            },
            {
              id: "A5.2",
              title: "Keep alternate paths visible for the analyst",
              context: "Top route plus secondary candidate routes",
              tools: "Decision support layer",
              guardrails: "This demo must not look like a rigid SOP with only one answer",
              output: "Primary route recommended while alternate routes remain visible",
              decisionType: "route-explanation",
              thinking: [
                "The agent should explain why one route is leading without hiding the others.",
                "This is how alternate scenarios stay visible in the same stream.",
                "A broader perspective helps the analyst understand dynamic possibilities."
              ],
              handoff: {
                owner: "Human analyst still reviewing",
                reason: "Agent recommendation is visible but not blindly enforced",
                route: "Explain and prepare escalation"
              }
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
              output: "Correct L1, L2, and L3 chain identified for this incident",
              decisionType: "ownership",
              thinking: [
                "If the route is pipeline, which team owns that platform in this support model?",
                "Does L2 belong to a vendor while L3 belongs to internal infrastructure?",
                "Is the same ownership chain still correct if the route changes to infra or gateway?"
              ],
              handoffType: "ownership"
            },
            {
              id: "A6.2",
              title: "Prepare structured context pack for handoff",
              context: "Incident record, lineage chain, platform evidence, route ranking, alternates",
              tools: "Context pack assembler",
              guardrails: "Handoff must include evidence, rationale, and alternate path visibility",
              output: "Ready-to-send escalation package for the next responsible owner",
              decisionType: "handoff",
              thinking: [
                "What should the next owner see immediately without reopening the whole investigation?",
                "Which route was chosen and which alternates are still visible?",
                "Why is this being handed to this team now?"
              ],
              handoffType: "final-handoff"
            }
          ]
        }
      ]
    }
  }
};

const state = {
  scenario: "finance-snowflake",
  platform: null,
  reproducibility: null,
  route: null,
  ownership: null
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
  workflowCanvas: document.getElementById("workflowCanvas")
};

function currentScenario() {
  return demoData.scenarios[state.scenario];
}

function initStateFromScenario() {
  const s = currentScenario();
  state.platform = s.defaultState.platform;
  state.reproducibility = s.defaultState.reproducibility;
  state.route = s.defaultState.route;
  state.ownership = s.defaultState.ownership;
}

function labelForPlatform(platform) {
  switch (platform) {
    case "snowflake":
      return "Snowflake";
    case "databricks":
      return "Databricks";
    case "airflow":
      return "Airflow";
    case "adf":
      return "Azure Data Factory";
    case "custom":
      return "Custom Batch Platform";
    default:
      return platform;
  }
}

function routeOptionsForScenario() {
  const s = currentScenario();
  return s.routeRanking.map((r) => ({
    key: r.key,
    label: demoData.routes[r.key].title,
    score: r.score
  }));
}

function addListItems(node, items) {
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.appendChild(li);
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

function renderThinkingBox(items) {
  return `
    <div class="thinking-box">
      <div class="box-title">What the agent is thinking</div>
      <div class="box-list">
        ${items.map((item) => `<div class="path-connector">${item}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderDecisionOptions(type) {
  if (type === "platform") {
    const options = [
      { value: "snowflake", label: "Resolved to Snowflake" },
      { value: "databricks", label: "Resolved to Databricks" },
      { value: "airflow", label: "Resolved to Airflow" },
      { value: "adf", label: "Resolved to Azure Data Factory" },
      { value: "custom", label: "Resolved to Custom Batch Platform" }
    ];

    return `
      <div class="decision-box">
        <div class="box-title">Decision path inside the agent</div>
        <div class="box-list">
          ${options
            .map(
              (opt) => `
              <button class="decision-option ${state.platform === opt.value ? "active" : ""}"
                data-decision-type="platform"
                data-value="${opt.value}">
                <span class="choice-label">Platform determination</span>
                <span class="choice-value">${opt.label}</span>
              </button>
            `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (type === "platform-summary") {
    return `
      <div class="decision-box">
        <div class="box-title">Current platform-specific tool selection</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Selected platform</span>
            <span class="choice-value">${labelForPlatform(state.platform)}</span>
          </div>
          <div>
            <span class="choice-label">Mapped toolset</span>
            <span class="choice-value">${demoData.platformToolsets[state.platform].join(", ")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (type === "reproducibility") {
    const options = [
      { value: "refresh-recovered", label: "Manual refresh recovered the dashboard" },
      { value: "still-stale", label: "Dashboard is still stale after validation" },
      { value: "partial-stale", label: "Only part of the dashboard appears stale" }
    ];

    return `
      <div class="decision-box">
        <div class="box-title">Validation decision inside the agent</div>
        <div class="box-list">
          ${options
            .map(
              (opt) => `
              <button class="decision-option ${state.reproducibility === opt.value ? "active" : ""}"
                data-decision-type="reproducibility"
                data-value="${opt.value}">
                <span class="choice-label">Validation result</span>
                <span class="choice-value">${opt.label}</span>
              </button>
            `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (type === "route-preview") {
    const preview = getRoutePreviewText();
    return `
      <div class="decision-box">
        <div class="box-title">How current evidence changes route direction</div>
        <div class="box-list">
          <div>${preview.primary}</div>
          <div>${preview.secondary}</div>
        </div>
      </div>
    `;
  }

  if (type === "platform-evidence") {
    return `
      <div class="decision-box">
        <div class="box-title">Platform evidence selected by the agent</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Resolved platform</span>
            <span class="choice-value">${labelForPlatform(state.platform)}</span>
          </div>
          <div>
            <span class="choice-label">Evidence sources</span>
            <span class="choice-value">${demoData.platformToolsets[state.platform].join(", ")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (type === "route") {
    const options = routeOptionsForScenario();
    return `
      <div class="decision-box">
        <div class="box-title">Route selection inside the agent</div>
        <div class="box-list">
          ${options
            .map(
              (opt) => `
              <button class="decision-option ${state.route === opt.key ? "active" : ""}"
                data-decision-type="route"
                data-value="${opt.key}">
                <span class="choice-label">Candidate route</span>
                <span class="choice-value">${opt.label} - ${opt.score}% confidence</span>
              </button>
            `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  if (type === "route-explanation") {
    const route = demoData.routes[state.route];
    const alternates = routeOptionsForScenario()
      .filter((r) => r.key !== state.route)
      .slice(0, 2);

    return `
      <div class="decision-box">
        <div class="box-title">Chosen route and visible alternates</div>
        <div class="box-list">
          <div>
            <span class="inline-route-badge">Chosen route</span>
            ${route.title}
          </div>
          <div>
            <span class="inline-route-badge">Why it leads</span>
            ${route.description}
          </div>
          <div>
            <span class="inline-route-badge">Alternates still visible</span>
            ${alternates.map((a) => a.label).join(", ")}
          </div>
        </div>
      </div>
    `;
  }

  if (type === "ownership") {
    const chain = getOwnershipChainForCurrentRoute();
    return `
      <div class="decision-box">
        <div class="box-title">Ownership and reassignment decision</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Selected route</span>
            <span class="choice-value">${demoData.routes[state.route].title}</span>
          </div>
          <div>
            <span class="choice-label">Ownership model</span>
            <span class="choice-value">${formatOwnershipLabel(state.ownership)}</span>
          </div>
          <div>
            <span class="choice-label">Likely next owner</span>
            <span class="choice-value">${chain[0]}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (type === "handoff") {
    const chain = getOwnershipChainForCurrentRoute();
    return `
      <div class="decision-box">
        <div class="box-title">Final handoff package assembled by the agent</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Route being handed over</span>
            <span class="choice-value">${demoData.routes[state.route].title}</span>
          </div>
          <div>
            <span class="choice-label">Immediate target</span>
            <span class="choice-value">${chain[0]}</span>
          </div>
          <div>
            <span class="choice-label">Escalation chain</span>
            <span class="choice-value">${chain.join(" -> ")}</span>
          </div>
        </div>
      </div>
    `;
  }

  return "";
}

function formatOwnershipLabel(value) {
  if (value === "multi-vendor") return "Multi-Vendor";
  if (value === "internal") return "Internal";
  if (value === "hybrid") return "Hybrid";
  return value;
}

function getRoutePreviewText() {
  if (state.reproducibility === "refresh-recovered") {
    return {
      primary:
        "Current strongest signal: cache or rendering issue is more likely because refresh recovered the dashboard.",
      secondary:
        "Alternate routes remain visible in case the freshness timestamp still looks inconsistent."
    };
  }

  if (state.reproducibility === "partial-stale") {
    return {
      primary:
        "Current strongest signal: pipeline or partial-processing issue remains strong because only part of the dashboard is stale.",
      secondary:
        "Infra and source routes remain visible if platform logs do not show a direct failure."
    };
  }

  return {
    primary:
      "Current strongest signal: the dashboard remains stale after validation, so deeper platform, source, or gateway checks remain active.",
    secondary:
      "Cache route weakens, but alternate routes remain visible until platform evidence confirms the strongest path."
  };
}

function getOwnershipChainForCurrentRoute() {
  const chain = [...demoData.ownershipModels[state.ownership]];

  if (state.route === "pipeline") {
    return [chain[2], chain[3], chain[4]];
  }
  if (state.route === "infra") {
    return [chain[3], chain[4]];
  }
  if (state.route === "gateway") {
    return [chain[1], chain[2], chain[3]];
  }
  if (state.route === "source") {
    return [chain[4], chain[2]];
  }
  return [chain[1], chain[2]];
}

function getHandoffBox(task) {
  const chain = getOwnershipChainForCurrentRoute();

  if (task.handoffType === "ownership") {
    return `
      <div class="handoff-box">
        <div class="box-title">How reassignment is decided</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Current route</span>
            <span class="choice-value">${demoData.routes[state.route].title}</span>
          </div>
          <div>
            <span class="choice-label">Why reassignment happens</span>
            <span class="choice-value">The ownership chain depends on both the selected route and the support model, not just the incident title.</span>
          </div>
          <div>
            <span class="choice-label">Likely next owner</span>
            <span class="choice-value">${chain[0]}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (task.handoffType === "final-handoff") {
    return `
      <div class="handoff-box">
        <div class="box-title">Structured handoff prepared by the agent</div>
        <div class="box-list">
          <div>
            <span class="choice-label">Context pack includes</span>
            <span class="choice-value">Incident intake, lineage resolution, platform evidence, selected route, and visible alternates</span>
          </div>
          <div>
            <span class="choice-label">Immediate recipient</span>
            <span class="choice-value">${chain[0]}</span>
          </div>
          <div>
            <span class="choice-label">Escalation chain</span>
            <span class="choice-value">${chain.join(" -> ")}</span>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="handoff-box">
      <div class="box-title">Current handoff status</div>
      <div class="box-list">
        <div>
          <span class="choice-label">Owner</span>
          <span class="choice-value">${task.handoff.owner}</span>
        </div>
        <div>
          <span class="choice-label">Reason</span>
          <span class="choice-value">${task.handoff.reason}</span>
        </div>
        <div>
          <span class="choice-label">Route state</span>
          <span class="choice-value">${task.handoff.route}</span>
        </div>
      </div>
    </div>
  `;
}

function getAlternateBox(alternates) {
  return `
    <div class="alternate-box">
      <div class="box-title">Alternate routes or possibilities still visible</div>
      <div class="box-list">
        ${alternates.map((item) => `<div>${item}</div>`).join("")}
      </div>
    </div>
  `;
}

function createTaskCard(task, stepAlternates) {
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

      <div class="agent-thinking-zone">
        ${renderThinkingBox(task.thinking)}
        ${renderDecisionOptions(task.decisionType)}
        ${getHandoffBox(task)}
        ${getAlternateBox(stepAlternates)}
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
          ${step.tasks.map((task) => createTaskCard(task, step.alternates)).join("")}
        </div>
      </div>
    `;

    el.workflowCanvas.appendChild(block);
  });

  bindWorkflowInteractions();
}

function bindWorkflowInteractions() {
  document.querySelectorAll(".workflow-accordion").forEach((btn) => {
    btn.addEventListener("click", () => {
      const block = btn.parentElement;
      block.classList.toggle("open");
    });
  });

  document.querySelectorAll(".decision-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.decisionType;
      const value = btn.dataset.value;

      if (type === "platform") {
        state.platform = value;
      }

      if (type === "reproducibility") {
        state.reproducibility = value;

        if (value === "refresh-recovered") {
          state.route = "cache";
        }
        if (value === "partial-stale" && state.route === "cache") {
          state.route = "pipeline";
        }
      }

      if (type === "route") {
        state.route = value;
      }

      renderWorkflow();
    });
  });
}

function renderAll() {
  initStateFromScenario();
  renderMetadata();
  renderTicket();
  renderWorkflow();
}

renderAll();

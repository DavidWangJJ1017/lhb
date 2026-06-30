const state = {
  search: "",
  time: [],
  city: [],
  industry: [],
  type: [],
  status: ["即将开始", "筹备中", "待确认"],
  source: [],
  sort: "heat",
  visibleCount: 12,
  isLoadingMore: false
};

let loadMoreObserver = null;
const statusFilterOrder = ["进行中", "即将开始", "筹备中", "待确认", "历史"];

function matchesQuick(activity) {
  return true;
}

function filteredActivities() {
  const tokens = state.search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return activities.filter((activity) => {
    const haystack = [
      activity.title,
      activity.city,
      activity.venue,
      activity.type,
      activity.host,
      activity.summary,
      activity.scale,
      activity.ticketInfo,
      activity.leadAngle,
      activity.sourceType,
      activity.sourceConfidence,
      ...activity.industries,
      ...activity.brands,
      ...activity.fitProducts,
      ...activity.audience,
      ...activity.attendeeRoles,
      ...activity.representativeBrands,
      ...activity.mediaAccounts
    ].join(" ").toLowerCase();

    return (tokens.length === 0 || tokens.every((token) => haystack.includes(token)))
      && matchesTime(activity)
      && matchesCity(activity)
      && (state.industry.length === 0 || state.industry.some((item) => activity.industries.includes(item)))
      && (state.type.length === 0 || state.type.includes(activity.type))
      && (state.status.length === 0 || state.status.includes(activity.status))
      && (state.source.length === 0 || state.source.includes(activity.sourceType))
      && matchesQuick(activity);
  });
}

function matchesCity(activity) {
  if (state.city.length === 0) return true;
  return state.city.some((city) => (
    city === "其他"
      ? !priorityCities.includes(activity.city)
      : activity.city === city
  ));
}

function matchesTime(activity) {
  if (state.time.length === 0) return true;
  return state.time.some((time) => matchesSingleTime(activity, time));
}

function matchesSingleTime(activity, time) {
  if (time === "待确认") return !activity.startDate;
  if (time === "历史") return activity.status === "历史";
  if (!activity.startDate) return false;
  const month = Number(activity.startDate.slice(5, 7));
  if (time === "上半年") return month >= 1 && month <= 6;
  if (time === "下半年") return month >= 7 && month <= 12;
  if (time === "Q1") return month >= 1 && month <= 3;
  if (time === "Q2") return month >= 4 && month <= 6;
  if (time === "Q3") return month >= 7 && month <= 9;
  if (time === "Q4") return month >= 10 && month <= 12;
  return false;
}

function renderFilter(id, values, key) {
  const root = byId(id);
  root.innerHTML = ["全部", ...values].map((value) => (
    `<button class="filter-button ${isFilterActive(key, value) ? "active" : ""}" data-key="${key}" data-value="${value}" type="button">${value}</button>`
  )).join("");
}

function isFilterActive(key, value) {
  if (value === "全部") return state[key].length === 0;
  return state[key].includes(value);
}

function toggleFilter(key, value) {
  if (value === "全部") {
    state[key] = [];
    return;
  }
  state[key] = state[key].includes(value)
    ? state[key].filter((item) => item !== value)
    : [...state[key], value];
}

function resetVisibleCount() {
  state.visibleCount = 12;
  state.isLoadingMore = false;
}

function renderActiveFilters() {
  const active = [
    ["search", state.search.trim() ? `搜索：${state.search.trim()}` : ""],
    ...state.time.map((item) => [`time:${item}`, `时间：${item}`]),
    ...state.city.map((item) => [`city:${item}`, `城市：${item}`]),
    ...state.industry.map((item) => [`industry:${item}`, `行业：${item}`]),
    ...state.type.map((item) => [`type:${item}`, `类型：${item}`]),
    ...state.status.map((item) => [`status:${item}`, `状态：${item}`]),
    ...state.source.map((item) => [`source:${item}`, `来源：${item}`])
  ].filter(([, label]) => label);
  byId("activeFilters").innerHTML = active.length
    ? active.map(([key, label]) => `<span class="active-filter">${label}<button data-clear-filter="${key}" type="button" aria-label="移除${label}">×</button></span>`).join("")
    : `<span class="section-note">未选择筛选条件，当前展示全部活动。</span>`;
}

function isPendingActivity(activity) {
  return ["即将开始", "筹备中", "待确认"].includes(activity.status);
}

function distributionFrom(items, picker) {
  const counts = new Map();
  items.forEach((item) => {
    const values = picker(item);
    (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "zh"));
}

function compactDistribution(rows, limit = 5) {
  if (rows.length <= limit) return rows;
  const visible = rows.slice(0, limit - 1);
  const otherValue = rows.slice(limit - 1).reduce((sum, row) => sum + row.value, 0);
  return [...visible, { label: "其他", value: otherValue }];
}

function renderPieChart(rootId, rows) {
  const root = byId(rootId);
  const data = compactDistribution(rows);
  const total = data.reduce((sum, row) => sum + row.value, 0);
  if (!total) {
    root.innerHTML = `<div class="empty">暂无未进行活动数据</div>`;
    return;
  }
  const palette = ["#2563eb", "#0f766e", "#f59e0b", "#e11d48", "#7c3aed", "#0891b2", "#65a30d", "#64748b"];
  let cursor = 0;
  const gradient = data.map((row, index) => {
    const start = cursor;
    const end = cursor + (row.value / total) * 100;
    cursor = end;
    return `${palette[index % palette.length]} ${start}% ${end}%`;
  }).join(", ");
  root.innerHTML = `
    <div class="pie-wrap">
      <div class="pie-visual" style="background: conic-gradient(${gradient});">
        <div><strong>${total}</strong><span>未进行</span></div>
      </div>
      <div class="pie-legend">
        ${data.map((row, index) => {
          const percent = ((row.value / total) * 100).toFixed(1).replace(".0", "");
          return `
            <div class="pie-legend-item">
              <span class="pie-dot" style="background:${palette[index % palette.length]}"></span>
              <span class="pie-label">${row.label}</span>
              <strong>${row.value}</strong>
              <em>${percent}%</em>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderMetrics(data) {
  const pendingActivities = activities.filter(isPendingActivity);
  byId("totalCount").textContent = activities.length;
  byId("pendingCount").textContent = pendingActivities.length;
  byId("cityCount").textContent = unique(activities.map((item) => item.city)).length;
  renderPieChart("pendingCityChart", distributionFrom(pendingActivities, (item) => item.city));
  renderPieChart("pendingIndustryChart", distributionFrom(pendingActivities, (item) => item.industries));
  renderPieChart("pendingTypeChart", distributionFrom(pendingActivities, (item) => item.type));
  byId("resultSummary").textContent = `当前筛选 ${data.length} 条`;
  byId("filterResultCount").textContent = `${data.length} 条结果`;
}

const rankScore = { S: 34, A: 24, B: 14 };
const statusHeatScore = { "即将开始": 24, "筹备中": 20, "进行中": 16, "历史": 6, "待确认": 0 };
const confidenceScore = { "高": 16, "中": 10, "低": 2 };
const industryWeight = {
  "运动户外": 10,
  "香氛": 10,
  "美妆": 10,
  "潮玩": 10,
  "IP类": 10,
  "鞋服": 10,
  "商场": 8,
  "3C数码": 8,
  "茶饮连锁": 8,
  "食品饮料": 8,
  "家居家装": 7,
  "宠物": 6,
  "母婴": 6
};

function activityTimeValue(activity) {
  if (!activity.startDate) return Number.MAX_SAFE_INTEGER;
  return Number(activity.startDate.replaceAll("-", ""));
}

function activityHeatScore(activity) {
  const industryScore = Math.min(24, (activity.industries || []).reduce((sum, industry) => sum + (industryWeight[industry] || 2), 0));
  const scaleText = [activity.scale, activity.summary, activity.highlights?.join(" ")].join(" ");
  const scaleScore = /万|千|[0-9]\+|展商|观众|CEO|决策层|头部/.test(scaleText) ? 10 : 0;
  const peopleScore = [...(activity.attendeeRoles || []), ...(activity.representativeBrands || [])].join("").match(/CEO|创始人|总裁|董事长|负责人|总监|欧莱雅|迪卡侬|腾讯|京东|阿里|泡泡玛特|乐高/) ? 12 : 0;
  const cityScore = priorityCities.includes(activity.city) ? 8 : 4;
  const headlineScore = activity.isHeadline ? 10 : 0;
  const newScore = activity.isNew ? 6 : 0;
  return (rankScore[activity.rank] || 0)
    + industryScore
    + (statusHeatScore[activity.status] || 0)
    + (confidenceScore[activity.sourceConfidence] || 0)
    + scaleScore
    + peopleScore
    + cityScore
    + headlineScore
    + newScore;
}

function sortByTimeAsc(items) {
  return [...items].sort((a, b) => {
    const dateDiff = activityTimeValue(a) - activityTimeValue(b);
    if (dateDiff !== 0) return dateDiff;
    const rankWeight = { S: 0, A: 1, B: 2 } ;
    return (rankWeight[a.rank] ?? 9) - (rankWeight[b.rank] ?? 9);
  });
}

function sortByHeat(items) {
  return [...items].sort((a, b) => {
    const heatDiff = activityHeatScore(b) - activityHeatScore(a);
    if (heatDiff !== 0) return heatDiff;
    return activityTimeValue(a) - activityTimeValue(b);
  });
}

function sortActivities(items) {
  return state.sort === "time" ? sortByTimeAsc(items) : sortByHeat(items);
}

function renderNextEditionInline(activity) {
  if (!hasNextEditionLead(activity)) return "";
  return `<span class="next-edition-line"><strong>下届追踪：</strong>${renderNextEditionText(activity)}</span>`;
}

function renderFeatured() {
  const featured = sortByHeat(activities.filter((item) => item.isHeadline && item.status === "即将开始")).slice(0, 8);
  byId("featuredGrid").innerHTML = featured.map((activity) => `
    <article class="feature-card ${activity.rank.toLowerCase()} ${activity.image ? "" : "no-image"}">
      ${activity.image ? renderLazyImage("feature-image", activity) : ""}
      <div class="feature-body">
        <span class="rank ${activity.rank === "A" ? "a" : ""}">${activity.rank}级专题</span>
        <h3 class="card-title">${activity.title}</h3>
        <div class="card-meta">${activity.city} · ${activity.venue}<br>${renderDateText(activity)}</div>
        <p class="card-copy">${activity.leadAngle}</p>
        <div class="tag-row"><span class="tag">${activity.status}</span>${activity.industries.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
        <div class="card-actions">
          <span class="section-note">${activity.type} · 热度${activityHeatScore(activity)} · ${activity.sourceConfidence}可信</span>
          <a class="card-button" href="detail.html?id=${activity.id}" target="_blank" rel="noopener">查看</a>
        </div>
      </div>
    </article>
  `).join("");
}

function renderEvents(data) {
  const root = byId("eventList");
  if (!data.length) {
    root.innerHTML = `<div class="empty">没有符合条件的活动，换个城市、行业或关键词试试。</div>`;
    return;
  }

  const sorted = sortActivities(data);
  const visible = sorted.slice(0, state.visibleCount);
  root.innerHTML = visible.map((activity) => `
    <article class="event-card ${activity.image ? "" : "no-image"}">
      ${activity.image ? renderLazyImage("event-thumb", activity) : ""}
      <div class="event-content">
        <div class="event-card-head">
          <div class="event-main">
            <div class="event-title-row">
              <h3>${activity.title}</h3>
              <span class="tag">${activity.rank}级</span>
              <span class="tag">${activity.type}</span>
              ${activity.isNew ? `<span class="tag">新增</span>` : ""}
              ${activity.industries.slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
            <div class="card-meta">${activity.city} · ${activity.venue} · ${renderDateText(activity)} · 热度${activityHeatScore(activity)} · ${activity.sourceType} · ${activity.sourceConfidence}可信</div>
          </div>
          <div class="event-actions-inline">
            <span class="status ${statusClass(activity.status)}">${activity.status}</span>
            <a class="card-button" href="detail.html?id=${activity.id}" target="_blank" rel="noopener">详情</a>
          </div>
        </div>
        <div class="event-brief">
          <span>${activity.summary}</span>
          ${renderNextEditionInline(activity)}
          <span><strong>切入：</strong>${activity.leadAngle}</span>
        </div>
      </div>
    </article>
  `).join("") + (sorted.length > visible.length ? `
    <div class="load-more-row" id="loadMoreSentinel" aria-live="polite">
      <span class="loading-dot"></span>
      <span class="section-note">继续下滑加载更多，已展示 ${visible.length} / ${sorted.length} 条</span>
    </div>
  ` : `
    <div class="load-more-row done" aria-live="polite">
      <span class="section-note">已展示全部 ${sorted.length} 条</span>
    </div>
  `);
  observeLoadMore();
}

function renderAll() {
  const data = filteredActivities();
  renderMetrics(data);
  renderFilter("timeFilters", ["上半年", "下半年", "Q1", "Q2", "Q3", "Q4", "待确认", "历史"], "time");
  renderFilter("cityFilters", [...priorityCities, "其他"], "city");
  renderFilter("industryFilters", prioritySort(unique(activities.flatMap((item) => item.industries)), priorityIndustries), "industry");
  renderFilter("typeFilters", unique(activities.map((item) => item.type)).sort(), "type");
  renderFilter("statusFilters", prioritySort(unique(activities.map((item) => item.status)), statusFilterOrder), "status");
  renderFilter("sourceFilters", prioritySort(unique([...activities.map((item) => item.sourceType), "活动行"]), prioritySources), "source");
  renderActiveFilters();
  renderSortTabs();
  renderFeatured();
  renderEvents(data);
  hydrateImages();
}

function renderSortTabs() {
  document.querySelectorAll("[data-sort]").forEach((button) => {
    button.classList.toggle("active", button.dataset.sort === state.sort);
  });
}

document.addEventListener("click", (event) => {
  const filter = event.target.closest("[data-key]");
  if (filter) {
    resetVisibleCount();
    toggleFilter(filter.dataset.key, filter.dataset.value);
    renderAll();
    return;
  }

  const clear = event.target.closest("[data-clear-filter]");
  if (clear) {
    resetVisibleCount();
    const [key, value] = clear.dataset.clearFilter.split(":");
    if (key === "search") {
      state.search = "";
      byId("searchInput").value = "";
    } else if (value) {
      state[key] = state[key].filter((item) => item !== value);
    } else {
      state[key] = [];
    }
    renderAll();
    return;
  }

  const sort = event.target.closest("[data-sort]");
  if (sort) {
    state.sort = sort.dataset.sort;
    resetVisibleCount();
    renderAll();
  }
});

byId("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value;
  resetVisibleCount();
  renderAll();
});

byId("searchButton").addEventListener("click", () => {
  byId("events").scrollIntoView({ behavior: "smooth", block: "start" });
});

byId("clearFilters").addEventListener("click", () => {
  state.search = "";
  state.time = [];
  state.city = [];
  state.industry = [];
  state.type = [];
  state.status = [];
  state.source = [];
  state.sort = "heat";
  resetVisibleCount();
  byId("searchInput").value = "";
  renderAll();
});

function loadMoreEvents() {
  const total = filteredActivities().length;
  if (state.isLoadingMore || state.visibleCount >= total) return;
  state.isLoadingMore = true;
  window.requestAnimationFrame(() => {
    state.visibleCount = Math.min(state.visibleCount + 12, total);
    renderEvents(filteredActivities());
    hydrateImages(byId("eventList"));
    state.isLoadingMore = false;
  });
}

function observeLoadMore() {
  loadMoreObserver?.disconnect();
  const sentinel = byId("loadMoreSentinel");
  if (!sentinel) return;
  if ("IntersectionObserver" in window) {
    loadMoreObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMoreEvents();
    }, { rootMargin: "480px 0px" });
    loadMoreObserver.observe(sentinel);
    return;
  }
  loadMoreObserver = null;
}

window.addEventListener("scroll", () => {
  if ("IntersectionObserver" in window) return;
  const sentinel = byId("loadMoreSentinel");
  if (!sentinel) return;
  if (sentinel.getBoundingClientRect().top < window.innerHeight + 480) loadMoreEvents();
}, { passive: true });

renderAll();
